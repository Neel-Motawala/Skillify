import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
} from "chart.js";
// import styles from "../Styles/TestPage/MyAnalytics.module.css";
import styles from "../Styles/Users/DetailUserTest.module.css";
import { useNavigate, useParams } from "react-router-dom";
import BackButton from "../Components/BackButton";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DetailUserTest() {
    const [summary, setSummary] = useState({
        totalTests: 0,
        accuracy: 0,
        avgScore: 0,
        testTypeCount: {},
        stageCount: {},
        accuracyDetails: { mcq: 0, theory: 0, code: 0 },
        counts: {
            mcq: { correct: 0, total: 0 },
            theory: { score: 0, total: 0 },
            code: { correct: 0, total: 0 },
        },
    });
    const navigate = useNavigate();


    const userId = useParams().userId;

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const testRes = await axios.get(
                    `http://localhost:5000/api/user-test/user/${userId}`
                );

                const tests = testRes.data || [];
                if (!tests.length) return;

                let mcqTotal = 0,
                    mcqCorrect = 0;

                let theoryTotal = 0,
                    theoryScore = 0;

                let codeTotal = 0,
                    codeCorrect = 0;

                let totalQuestions = 0;
                let totalCorrect = 0;

                const testTypeCount = {};
                const stageCount = {};

                const testResults = await Promise.all(
                    tests.map(async (t) => {
                        testTypeCount[t.test_type] = (testTypeCount[t.test_type] || 0) + 1;
                        stageCount[t.stage] = (stageCount[t.stage] || 0) + 1;

                        if (t.test_type === "code") {
                            const codeRes = await axios.get(
                                `http://localhost:5000/api/results/user-code/${t.id}`
                            );

                            const subs = codeRes.data?.submissions || [];
                            return subs.map((s) => ({
                                type: "code",
                                is_correct: s.is_correct,
                            }));
                        }

                        const r = await axios.get(
                            `http://localhost:5000/api/results/${t.id}`
                        );
                        return r.data || [];
                    })
                );

                const results = testResults.flat();

                results.forEach((item) => {
                    totalQuestions++;

                    if (item.type === "mcq") {
                        mcqTotal++;
                        if (item.is_correct) {
                            mcqCorrect++;
                            totalCorrect++;
                        }
                    }

                    if (item.type === "theory") {
                        theoryTotal++;
                        if (item.answer_score != null) {
                            theoryScore += item.answer_score;
                        }
                    }

                    if (item.type === "code") {
                        codeTotal++;
                        if (item.is_correct === 1) {
                            codeCorrect++;
                            totalCorrect++;
                        }
                    }
                });

                const totalPossible =
                    mcqTotal * 1 +
                    theoryTotal * 10 +
                    codeTotal * 1;

                const totalObtained =
                    mcqCorrect * 1 +
                    theoryScore +
                    codeCorrect * 1;

                const accuracy =
                    totalQuestions > 0
                        ? Math.round((totalCorrect / totalQuestions) * 100)
                        : 0;

                const avgScore =
                    totalPossible > 0
                        ? Math.round((totalObtained / totalPossible) * 100)
                        : 0;

                const mcqAccuracy =
                    mcqTotal > 0 ? Math.round((mcqCorrect / mcqTotal) * 100) : 0;

                const theoryAccuracy =
                    theoryTotal > 0
                        ? Math.round((theoryScore / (theoryTotal * 10)) * 100)
                        : 0;

                const codeAccuracy =
                    codeTotal > 0 ? Math.round((codeCorrect / codeTotal) * 100) : 0;

                setSummary({
                    totalTests: tests.length,
                    accuracy,
                    avgScore, // now percentage
                    testTypeCount,
                    stageCount,
                    accuracyDetails: {
                        mcq: mcqAccuracy,
                        theory: theoryAccuracy,
                        code: codeAccuracy,
                    },
                    counts: {
                        mcq: { correct: mcqCorrect, total: mcqTotal },
                        theory: { score: theoryScore, total: theoryTotal },
                        code: { correct: codeCorrect, total: codeTotal },
                    },
                });
            } catch (err) {
                console.error("Error fetching analytics:", err);
            }
        };

        fetchAnalytics();
    }, [userId]);

    const { testTypeCount, stageCount, accuracyDetails, totalTests, accuracy, avgScore } = summary;

    const pieData = {
        labels: Object.keys(testTypeCount),
        datasets: [
            {
                data: Object.values(testTypeCount),
                backgroundColor: ["#5FA8AF", "#5F8FAF", "#5FAF98"],
                borderWidth: 0,
            },
        ],
    };

    const makeDoughnutData = (value) => ({
        labels: ["Accuracy", "Remaining"],
        datasets: [
            {
                data: [value, Math.max(0, 100 - value)],
                backgroundColor: ["#5FAF98", "#E5E5E5"],
                borderWidth: 0,
            },
        ],
    });

    const barData = {
        labels: Object.keys(stageCount).length
            ? Object.keys(stageCount)
            : ["No Data"],
        datasets: [
            {
                label: "Tests per Stage",
                data: Object.values(stageCount).length
                    ? Object.values(stageCount)
                    : [0],
                backgroundColor: "#5F8FAF",
                borderRadius: 6,
                maxBarThickness: 36,
            },
        ],
    };

    const pieOptions = {
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12 } } },
        maintainAspectRatio: true,
        aspectRatio: 1.2,
    };

    const doughnutOptions = {
        plugins: { legend: { display: false } },
        maintainAspectRatio: true,
        aspectRatio: 1,
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.8,
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        plugins: { legend: { display: false } },
    };

    return (
        <div className={styles.analyticsContainer}>

            <div className={styles.headerRow}>
                <BackButton to="/admin-dashboard/user-report" label="Back" />

                <h3 className={styles.title}>Performance Analytics</h3>
            </div>


            <div className={styles.summaryBar}>
                <div className={styles.summaryItem}>
                    <h4>{totalTests || 0}</h4>
                    <p>Total Tests</p>
                </div>

                <div className={styles.summaryItem}>
                    <h4>{accuracy || 0}%</h4>
                    <p>Overall Accuracy</p>
                </div>

                <div className={styles.summaryItem}>
                    <h4>{avgScore || 0}/100</h4>
                    <p>Average Score</p>
                </div>
            </div>

            <div className={styles.topGrid}>
                <div className={styles.chartCardSmall}>
                    <div className={styles.chartTitle}>Test Type Distribution</div>
                    <div className={styles.chartInner}>
                        <Pie data={pieData} options={pieOptions} />
                    </div>
                </div>

                <div className={styles.accuracyGrid}>
                    {Object.entries(accuracyDetails).map(([type, value]) => (
                        <div key={type} className={styles.accuracyCard}>
                            <div className={styles.chartInnerSmall}>
                                <Doughnut data={makeDoughnutData(value)} options={doughnutOptions} />
                            </div>

                            <div className={styles.accuracyMeta}>
                                <div className={styles.accTitle}>{type.toUpperCase()}</div>
                                <div className={styles.accValue}>{value || 0}%</div>

                                {type === "mcq" && (
                                    <div className={styles.accDetail}>
                                        {summary.counts.mcq.correct} / {summary.counts.mcq.total} correct
                                    </div>
                                )}

                                {type === "theory" && (
                                    <div className={styles.accDetail}>
                                        {Number(summary.counts.theory.score).toFixed(1)} /
                                        {Number(summary.counts.theory.total * 10).toFixed(0)} points
                                    </div>
                                )}

                                {type === "code" && (
                                    <div className={styles.accDetail}>
                                        {summary.counts.code.correct} / {summary.counts.code.total} passed
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.barChartBox}>
                <div className={styles.barHeader}>
                    <h5>Stage-wise Performance</h5>
                </div>
                <div className={styles.barWrapper}>
                    <Bar data={barData} options={barOptions} />
                </div>
            </div>
        </div>
    );

}
