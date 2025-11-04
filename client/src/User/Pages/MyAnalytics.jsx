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
import styles from "../Styles/TestPage/MyAnalytics.module.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function MyAnalytics() {
    const [summary, setSummary] = useState({
        totalTests: 0,
        accuracy: 0,
        avgScore: 0,
        testTypeCount: {},
        stageCount: {},
        accuracyDetails: { mcq: 0, theory: 0, code: 0 },
    });

    const userId = localStorage.getItem("id");

    useEffect(() => {
        const fetchUserTests = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/user-test/user/${userId}`);
                const tests = res.data || [];
                if (!tests.length) {
                    setSummary((s) => ({ ...s }));
                    return;
                }

                let totalCorrect = 0,
                    totalQuestions = 0,
                    totalScore = 0,
                    mcqCorrect = 0,
                    mcqTotal = 0,
                    theoryScore = 0,
                    theoryTotal = 0,
                    codeScore = 0,
                    codeTotal = 0;
                const testTypeCount = {},
                    stageCount = {};

                const allResults = await Promise.all(
                    tests.map(async (t) => {
                        testTypeCount[t.test_type] = (testTypeCount[t.test_type] || 0) + 1;
                        stageCount[t.stage] = (stageCount[t.stage] || 0) + 1;
                        const r = await axios.get(`http://localhost:5000/api/results/${t.id}`);
                        return r.data || [];
                    })
                );

                const results = allResults.flat();

                results.forEach((a) => {
                    if (a.type === "mcq") {
                        totalQuestions++; mcqTotal++;
                        if (a.is_correct) { totalCorrect++; mcqCorrect++; }
                    } else if (a.type === "theory") {
                        totalQuestions++; theoryTotal++;
                        if (a.answer_score != null) { totalScore += a.answer_score; theoryScore += a.answer_score; }
                    } else if (a.type === "code") {
                        totalQuestions++; codeTotal++;
                        if (a.answer_score != null) { totalScore += a.answer_score; codeScore += a.answer_score; }
                    }
                });

                const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
                const avgScore = totalQuestions ? Math.round(totalScore / totalQuestions) : 0;
                const mcqAccuracy = mcqTotal ? Math.round((mcqCorrect / mcqTotal) * 100) : 0;
                const theoryAccuracy = theoryTotal ? Math.round((theoryScore / theoryTotal) * 10) : 0;
                const codeAccuracy = codeTotal ? Math.round((codeScore / codeTotal) * 10) : 0;

                setSummary({
                    totalTests: tests.length,
                    accuracy,
                    avgScore,
                    testTypeCount,
                    stageCount,
                    accuracyDetails: { mcq: mcqAccuracy, theory: theoryAccuracy, code: codeAccuracy },
                });
            } catch (err) {
                console.error("Error fetching analytics:", err);
            }
        };
        fetchUserTests();
    }, [userId]);

    const { testTypeCount, stageCount, accuracyDetails, totalTests, accuracy, avgScore } = summary;

    const pieData = {
        labels: Object.keys(testTypeCount),
        datasets: [{ data: Object.values(testTypeCount), backgroundColor: ["#5FA8AF", "#5F8FAF", "#5FAF98"], borderWidth: 0 }],
    };

    const makeDoughnutData = (value) => ({
        labels: ["Accuracy", "Remaining"],
        datasets: [{ data: [value, Math.max(0, 100 - value)], backgroundColor: ["#5FAF98", "#E5E5E5"], borderWidth: 0 }],
    });

    const barData = {
        labels: Object.keys(stageCount).length ? Object.keys(stageCount) : ["No Data"],
        datasets: [
            {
                label: "Tests per Stage",
                data: Object.values(stageCount).length ? Object.values(stageCount) : [0],
                backgroundColor: "#5F8FAF",
                borderRadius: 6,
                maxBarThickness: 36,
            },
        ],
    };

    // Chart options tuned to keep charts compact and professional
    const pieOptions = { plugins: { legend: { position: "bottom", labels: { boxWidth: 12 } } }, maintainAspectRatio: true, aspectRatio: 1.2 };
    const doughnutOptions = { plugins: { legend: { display: false } }, maintainAspectRatio: true, aspectRatio: 1 };
    const barOptions = {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 2.8, // keeps bar chart compact
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        plugins: { legend: { display: false } },
    };

    return (
        <div className={styles.analyticsContainer}>
            <h3 className={styles.title}>Performance Analytics</h3>

            <div className={styles.summaryBar}>
                <div className={styles.summaryItem}><h4>{totalTests || 0}</h4><p>Total Tests</p></div>
                <div className={styles.summaryItem}><h4>{(accuracy || 0) + "%"}</h4><p>Overall Accuracy</p></div>
                <div className={styles.summaryItem}><h4>{(avgScore || 0) + "/100"}</h4><p>Average Score</p></div>
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
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.barChartBox}>
                <div className={styles.barHeader}><h5>Stage-wise Performance</h5></div>
                <div className={styles.barWrapper}>
                    <Bar data={barData} options={barOptions} />
                </div>
            </div>
        </div>
    );
}
