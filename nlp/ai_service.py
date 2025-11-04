from flask import Flask, request, jsonify
import os, re, math, spacy
from sentence_transformers import SentenceTransformer, util, CrossEncoder

try:
    import language_tool_python
except Exception:
    language_tool_python = None

app = Flask(__name__)

# ----------------- Model loading -----------------
try:
    nlp = spacy.load("en_core_web_md")
except Exception:
    nlp = spacy.load("en_core_web_sm")

bi_encoder = SentenceTransformer("sentence-transformers/all-mpnet-base-v2")

try:
    cross_encoder = CrossEncoder("cross-encoder/stsb-roberta-base")
    USE_CROSS = True
except Exception:
    cross_encoder = None
    USE_CROSS = False

lt_tool = None
if language_tool_python is not None:
    try:
        lt_tool = language_tool_python.LanguageTool("en-US")
    except Exception as e:
        print("LanguageTool init failed:", e)
        lt_tool = None

# ----------------- Utilities -----------------
WORD_RE = re.compile(r"\b\d+(?:\.\d+)?\b")
_emb_cache = {}


def normalize_text(text):
    return " ".join(text.strip().split()) if isinstance(text, str) else ""


def get_embedding(text):
    if text not in _emb_cache:
        _emb_cache[text] = bi_encoder.encode(
            text, convert_to_tensor=True, normalize_embeddings=True
        )
    return _emb_cache[text]


def grammar_score(text):
    if not text:
        return 0.0
    if lt_tool is not None:
        try:
            matches = lt_tool.check(text)
            n_tokens = max(1, len(text.split()))
            penalty = min(len(matches) / n_tokens, 1.0)
            return max(0.0, 1.0 - penalty)
        except Exception:
            pass
    tokens = text.split()
    n = max(1, len(tokens))
    non_alpha = sum(1 for t in tokens if not re.match(r"^[A-Za-z']+$", t))
    single_letters = sum(1 for t in tokens if len(t) == 1 and t.isalpha())
    penalty = (non_alpha * 0.6 + single_letters * 0.4) / n
    return max(0.0, 1.0 - min(penalty, 1.0))


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
    weights = [1.0 + (1.0 if " " in p else 0.0) for p in phrases]
    return phrases, weights


def soft_keyword_coverage(orig_phrases, orig_w, user_phrases):
    if not orig_phrases:
        return 0.0
    emb_o = bi_encoder.encode(
        orig_phrases, convert_to_tensor=True, normalize_embeddings=True
    )
    emb_u = bi_encoder.encode(
        user_phrases or [""], convert_to_tensor=True, normalize_embeddings=True
    )
    sim = util.cos_sim(emb_o, emb_u)
    total_w = sum(orig_w) or 1.0
    matched = []
    for i in range(len(orig_phrases)):
        best = float(sim[i].max().item()) if user_phrases else 0.0
        credit = max(0.0, (best - 0.75) / 0.25)
        matched.append(credit)
    return sum(c * w for c, w in zip(matched, orig_w)) / total_w


def named_entity_overlap(doc_o, doc_u):
    ents_o = {(ent.label_, ent.text.lower()) for ent in doc_o.ents}
    ents_u = {(ent.label_, ent.text.lower()) for ent in doc_u.ents}
    if not ents_o:
        return 1.0
    return len(ents_o & ents_u) / len(ents_o)


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
        if any(abs(a - b) <= max(0.01 * max(abs(a), 1.0), 1e-9) for b in nums_u)
    )
    return hits / len(nums_o)


def normalize_similarity(x):
    if -1 <= x <= 1:
        return (x + 1) / 2
    if 0 <= x <= 5:
        return x / 5
    try:
        return 1 / (1 + math.exp(-x))
    except:
        return 0.0


# ----------------- Revised Scoring -----------------
def compute_final_score(sem_sim, grammar, kw_cov, ent_cov, num_cov, length_score):
    # Early strict checks
    if sem_sim < 0.5:
        return 0.0
    elif sem_sim < 0.65:
        return 1.0
    elif sem_sim < 0.8 and kw_cov < 0.2:
        return 0.5

    # Weight configuration
    weights = {
        "semantic": 0.5,
        "grammar": 0.1,
        "keywords": 0.2,
        "entities": 0.05,
        "numbers": 0.05,
        "length": 0.1,
    }

    # Weighted average
    final = (
        sem_sim * weights["semantic"]
        + grammar * weights["grammar"]
        + kw_cov * weights["keywords"]
        + ent_cov * weights["entities"]
        + num_cov * weights["numbers"]
        + length_score * weights["length"]
    ) * 10

    # Clamp between 0.5 and 10
    final = max(0, min(10.0, round(final, 2)))

    return final


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

    if user.strip().lower() == original.strip().lower():
        return jsonify(
            {"success": True, "finalScore": 10.0, "details": {"note": "Exact match"}}
        )

    doc_o, doc_u = nlp(original), nlp(user)
    orig_phrases, orig_w = extract_keyphrases(doc_o)
    user_phrases, _ = extract_keyphrases(doc_u)

    grammar = grammar_score(user)
    kw_cov = soft_keyword_coverage(orig_phrases, orig_w, user_phrases)
    ent_cov = named_entity_overlap(doc_o, doc_u)
    num_cov = number_consistency(original, user)

    emb_o = get_embedding(original)
    emb_u = bi_encoder.encode(user, convert_to_tensor=True, normalize_embeddings=True)
    bi_sim = float(util.cos_sim(emb_o, emb_u).item())
    bi_sim_n = normalize_similarity(bi_sim)

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

    orig_tokens = max(1, len(original.split()))
    user_tokens = max(1, len(user.split()))
    len_ratio = user_tokens / orig_tokens
    length_score = math.exp(-abs(len_ratio - 1.0))

    final_score = compute_final_score(
        sem_sim, grammar, kw_cov, ent_cov, num_cov, length_score
    )

    details = {
        "semantic": round(sem_sim * 100, 2),
        "grammar": round(grammar * 100, 2),
        "keywordCoverage": round(kw_cov * 100, 2),
        "entities": round(ent_cov * 100, 2),
        "numbers": round(num_cov * 100, 2),
        "length": round(length_score * 100, 2),
    }

    criteria_used = {
        "semantic_weight": 0.4,
        "grammar_weight": 0.15,
        "keyword_weight": 0.2,
        "entity_weight": 0.1,
        "number_weight": 0.05,
        "length_weight": 0.1,
    }

    return jsonify(
        {
            "success": True,
            "finalScore": final_score,
            "details": details,
            # "criteriaUsed": criteria_used,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005)
