import React from "react";
import "./mcq.css";

function Mcq() {
    return (
        <div>

            {/* Container */}
            <div className="container">
                {/* Subject Header */}
                <div className="subject-header">
                    <img
                        src="https://cdn-icons-png.flaticon.com/512/919/919827.png"
                        alt="HTML Logo"
                    />
                    <h1>HTML</h1>
                </div>

                {/* Introduction */}
                <h2>Introduction</h2>
                <p className="intro">
                    HTML (HyperText Markup Language) is the backbone of web development.
                    It provides the structure for webpages by defining elements like
                    headings, paragraphs, links, images, and more. Learning HTML is the
                    first step to becoming a web developer, as it allows you to create and
                    design webpages that browsers can render. It’s widely used in building
                    websites, applications, and online content.
                </p>

                {/* Exam Options */}
                <div className="exam-options">
                    <h2>Choose the form of exam</h2>
                    <div className="options">
                        <div className="option-box">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/2910/2910768.png"
                                alt="MCQ"
                            />
                            <h3>MCQ</h3>
                        </div>
                        <div className="option-box">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/1157/1157109.png"
                                alt="Theory"
                            />
                            <h3>Theory</h3>
                        </div>
                        <div className="option-box">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/919/919854.png"
                                alt="Coding"
                            />
                            <h3>Coding</h3>
                        </div>
                    </div>
                </div>

                {/* Stage Section */}
                <div className="stage-section">
                    <h2>MCQ</h2>
                    <div className="stage-square">
                        <h3>Stages</h3>
                        <div className="stage-row">Stage 1: Basics & Syntax Recognition</div>
                        <div className="stage-row">Stage 2: Variables & Data Types</div>
                        <div className="stage-row">Stage 3: Control Flow & Logic</div>
                        <div className="stage-row">Stage 4: Functions & Reusability</div>
                        <div className="stage-row">Stage 5: Data Structures</div>
                        <div className="stage-row">
                            Stage 6: Error Handling & Advanced Concepts
                        </div>
                        <div className="stage-row">Stage 7: Real-World Applications</div>
                    </div>

                    {/* Start Exam Section */}
                    <div className="start-section">
                        <h2>Stage 1: Basics & Syntax Recognition</h2>
                        <button>Start Exam</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Mcq;
