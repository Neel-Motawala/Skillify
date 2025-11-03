# ai_service.py
from flask import Flask, request, jsonify
import os
import re
import math
import spacy
from sentence_transformers import SentenceTransformer, util, CrossEncoder

# Optional grammar tool
try:
    import language_tool_python
except Exception:
    language_tool_python = None

app = Flask(__name__)

# ----------------- Model loading -----------------
# spaCy
try:
    nlp = spacy.load("en_core_web_md")
except Exception:
    nlp = spacy.load("en_core_web_sm")

# stronger semantic encoder
bi_encoder = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

# cross encoder (optional)
try:
    cross_encoder = CrossEncoder("cross-encoder/stsb-roberta-base")
    USE_CROSS = True
except Exception:
    cross_encoder = None
    USE_CROSS = False

# initialize LanguageTool if available and path provided (avoid autoredownload)
lt_tool = None
if language_tool_python is not None:
    try:
        lt_path = os.environ.get(
            "LANGUAGETOOL_HOME"
        )  # set this to your local downloaded folder to avoid downloads
        if lt_path:
            lt_tool = language_tool_python.LanguageTool("en-US", path=lt_path)
        else:
            # try default init (may download on first run)
            lt_tool = language_tool_python.LanguageTool("en-US")
    except Exception as e:
        # fallback to None; we'll use simple grammar heuristic
        print(
            "LanguageTool init failed, falling back to simple grammar heuristic:",
            str(e),
        )
        lt_tool = None

# ----------------- Parameters (strict, meaning-first) -----------------
WEIGHTS = {
    "semantic": 0.70,  # dominant
    "grammar": 0.05,  # small influence
    "keywords": 0.03,  # minimal
    "entities": 0.06,
    "numbers": 0.06,
    "length": 0.10,  # penalize very short/very long answers
}

NEGATION_MAX_PENALTY = 0.30
SOFT_MATCH_THRESHOLD = 0.75
NUM_TOL_REL = 0.01
WORD_RE = re.compile(r"\b\d+(?:\.\d+)?\b")

# embedding cache
_emb_cache = {}


# ----------------- Utilities -----------------
def normalize_text(text):
    if not isinstance(text, str):
        return ""
    return " ".join(text.strip().split())


def get_embedding(text):
    # cache by exact original text string
    if text not in _emb_cache:
        _emb_cache[text] = bi_encoder.encode(
            text, convert_to_tensor=True, normalize_embeddings=True
        )
    return _emb_cache[text]


def grammar_score(text):
    """Return grammar correctness score in range [0,1]. Uses LanguageTool if available, else a heuristic."""
    if not text:
        return 0.0
    # LanguageTool path
    if lt_tool is not None:
        try:
            matches = lt_tool.check(text)
            n_tokens = max(1, len(text.split()))
            penalty = min(len(matches) / n_tokens, 1.0)
            return max(0.0, 1.0 - penalty)
        except Exception:
            pass
    # Fallback heuristic: penalize many non-word tokens and too many single-letter words
    tokens = text.split()
    n = max(1, len(tokens))
    non_alpha = sum(1 for t in tokens if not re.match(r"^[A-Za-z']+$", t))
    single_letters = sum(1 for t in tokens if len(t) == 1 and t.isalpha())
    penalty = (non_alpha * 0.6 + single_letters * 0.4) / n
    penalty = min(penalty, 1.0)
    return max(0.0, 1.0 - penalty)


def extract_keyphrases(doc):
    phrases = set()
    for ent in doc.ents:
        phrases.add(ent.text.lower())
    for nc in doc.noun_chunks:
        toks = [t.lemma_.lower() for t in nc if t.is_alpha and not t.is_stop]
        if toks:
            phrases.add(" ".join(toks))
    for t in doc:
        if t.is_alpha and not t.is_stop and t.pos_ in {"NOUN", "PROPN", "VERB", "ADJ"}:
            phrases.add(t.lemma_.lower())
    phrases = [p for p in phrases if len(p) > 1]
    weights = []
    ent_texts = {ent.text.lower() for ent in doc.ents}
    for p in phrases:
        w = 1.0
        if p in ent_texts:
            w += 1.0
        if " " in p:
            w += 0.5
        weights.append(w)
    return phrases, weights


def soft_keyword_coverage(orig_phrases, orig_w, user_phrases):
    if not orig_phrases:
        return 0.0
    # compute embeddings for phrase lists
    emb_o = bi_encoder.encode(
        orig_phrases, convert_to_tensor=True, normalize_embeddings=True
    )
    emb_u = bi_encoder.encode(
        user_phrases or [""], convert_to_tensor=True, normalize_embeddings=True
    )
    sim = util.cos_sim(emb_o, emb_u)
    matched = []
    for i, p in enumerate(orig_phrases):
        best = float(sim[i].max().item()) if user_phrases else 0.0
        credit = (
            0.0
            if best < SOFT_MATCH_THRESHOLD
            else (best - SOFT_MATCH_THRESHOLD) / (1 - SOFT_MATCH_THRESHOLD)
        )
        token_factor = 0.5 if len(p.split()) == 1 else 1.0
        matched.append(credit * token_factor)
    total_w = sum(orig_w) or 1.0
    score = sum(c * w for c, w in zip(matched, orig_w)) / total_w
    # cap keyword influence
    return float(min(score, 0.9))


def named_entity_overlap(doc_o, doc_u):
    ents_o = {(ent.label_, ent.text.lower()) for ent in doc_o.ents}
    ents_u = {(ent.label_, ent.text.lower()) for ent in doc_u.ents}
    if not ents_o:
        return 1.0
    inter = len(ents_o & ents_u)
    return inter / len(ents_o)


def extract_numbers(text):
    return [float(x) for x in WORD_RE.findall(text)]


def number_consistency(original, user):
    nums_o = extract_numbers(original)
    if not nums_o:
        return 1.0
    nums_u = extract_numbers(user)
    if not nums_u:
        return 0.0
    hits = sum(
        1
        for a in nums_o
        if any(abs(a - b) <= max(NUM_TOL_REL * max(abs(a), 1.0), 1e-9) for b in nums_u)
    )
    return hits / len(nums_o)


def negation_mismatch(doc_o, doc_u):
    def neg_heads(doc):
        return {t.head.lemma_.lower() for t in doc if t.dep_ == "neg"}

    o_negs, u_negs = neg_heads(doc_o), neg_heads(doc_u)
    flips = len((o_negs - u_negs)) + len((u_negs - o_negs))
    if not (o_negs or u_negs):
        return 0.0
    return min(NEGATION_MAX_PENALTY, 0.12 * flips)


def normalize_similarity(x):
    if -1.0 <= x <= 1.0:
        return (x + 1.0) / 2
    if 0.0 <= x <= 5.0:
        return x / 5
    try:
        return 1.0 / (1.0 + math.exp(-x))
    except:
        return 0.0


# ----------------- API -----------------
@app.route("/evaluate", methods=["POST"])
def evaluate():
    data = request.json or {}
    original = normalize_text(data.get("originalAnswer", ""))
    user = normalize_text(data.get("userAnswer", ""))

    if not original:
        return jsonify({"success": False, "error": "originalAnswer is required"}), 400
    if not user:
        return jsonify({"success": True, "finalScore": 0.0, "details": {}})

    # exact match quick path
    if user.strip().lower() == original.strip().lower():
        return jsonify(
            {"success": True, "finalScore": 10.0, "details": {"note": "Exact match"}}
        )

    # parse
    doc_o, doc_u = nlp(original), nlp(user)
    orig_phrases, orig_w = extract_keyphrases(doc_o)
    user_phrases, _ = extract_keyphrases(doc_u)

    # metrics
    grammar = grammar_score(user)  # 0..1
    kw_cov = soft_keyword_coverage(orig_phrases, orig_w, user_phrases)  # 0..1 (small)
    ent_cov = named_entity_overlap(doc_o, doc_u)
    num_cov = number_consistency(original, user)

    emb_o = get_embedding(original)
    emb_u = bi_encoder.encode(user, convert_to_tensor=True, normalize_embeddings=True)
    bi_sim = float(util.cos_sim(emb_o, emb_u).item())
    bi_sim_n = normalize_similarity(bi_sim)

    # cross-encoder when helpful
    if USE_CROSS and bi_sim_n > 0.45:
        try:
            ce_sim_n = normalize_similarity(
                float(cross_encoder.predict([(original, user)])[0])
            )
            sem_sim = 0.35 * bi_sim_n + 0.65 * ce_sim_n
        except Exception:
            sem_sim = bi_sim_n
    else:
        sem_sim = bi_sim_n

    # negation
    neg_pen = negation_mismatch(doc_o, doc_u)

    # length handling and short-answer penalty
    orig_tokens = max(1, len(original.split()))
    user_tokens = max(0, len(user.split()))
    len_ratio = user_tokens / orig_tokens
    length_score = math.exp(-abs(len_ratio - 1.0))
    min_expected = max(3, int(0.45 * orig_tokens))
    if user_tokens < min_expected:
        short_mult = max(0.0, (user_tokens / min_expected) * 0.5)
    else:
        short_mult = 1.0

    # gate keywords by semantic strength
    sem_gate = min(1.0, sem_sim / 0.8)  # below 0.8 reduces keyword effect
    kw_effective = kw_cov * sem_gate

    # final composition (0..1)
    final_0_1 = (
        WEIGHTS["semantic"] * sem_sim
        + WEIGHTS["grammar"] * grammar
        + WEIGHTS["keywords"] * kw_effective
        + WEIGHTS["entities"] * ent_cov
        + WEIGHTS["numbers"] * num_cov
        + WEIGHTS["length"] * length_score
    )

    # apply negation penalty
    final_0_1 = max(0.0, final_0_1 - neg_pen)

    # stricter semantic floor
    if sem_sim < 0.60:
        if sem_sim < 0.30:
            final_0_1 = 0.0
        else:
            final_0_1 *= (sem_sim / 0.60) * 0.5

    # short-answer multiplier
    final_0_1 *= short_mult

    final_0_1 = max(0.0, min(final_0_1, 1.0))
    final_score_10 = round(final_0_1 * 10.0, 2)

    details = {
        "semantic": round(sem_sim * 100, 2),
        "grammar": round(grammar * 100, 2),
        "keywordCoverage": round(kw_cov * 100, 2),
        "keywordEffective": round(kw_effective * 100, 2),
        "entities": round(ent_cov * 100, 2),
        "numbers": round(num_cov * 100, 2),
        "lengthRaw": round(length_score * 100, 2),
        "shortMultiplier": round(short_mult, 3),
        "negationPenalty": round(neg_pen * 100, 2),
        "usedCrossEncoder": USE_CROSS,
        "weights": WEIGHTS,
    }

    return jsonify({"success": True, "finalScore": final_score_10, "details": details})


if __name__ == "__main__":
    # production: consider using a proper WSGI server (gunicorn/uvicorn) and keep this process running
    app.run(host="0.0.0.0", port=5005)
