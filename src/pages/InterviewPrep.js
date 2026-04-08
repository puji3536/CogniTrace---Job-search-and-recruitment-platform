import React, { useState } from "react";
import "./InterviewPrep.css";
import {
    FaJava,
    FaPython,
    FaCloud,
    FaDatabase,
    FaCode,
    FaQuestionCircle,
    FaVideo,
    FaFolderOpen,
} from "react-icons/fa";
import { SiCplusplus } from "react-icons/si";


function InterviewPrep() {

    const docs = [
        {
            title: "Java Interview Prep",
            icon: <FaJava />,
            description: "OOP, Collections, JVM, Multithreading, and real interview questions.",
            file: "https://drive.google.com/file/d/1SzEUOhbDxsbA4i-h5vEPgDy21gCn4HRX/view?usp=sharing"
        },
        {
            title: "Python Interview Prep",
            icon: <FaPython />,
            description: "Python basics, OOP, modules, coding interview questions.",
            file: "https://drive.google.com/file/d/1JEJKhJ6kf546yOG6QJbS1dJpntbUdgRi/view?usp=sharing"
        },
        {
            title: "C++ Notes",
            icon: <SiCplusplus />,
            description: "OOP, STL, pointers & interview questions.",
            file: "https://drive.google.com/file/d/1Dx-9oWD0RN4uB6xnjrBhjbjE4CMAyZr8/view?usp=sharing"
        },

        {
            title: "SQL & DBMS Notes",
            icon: <FaDatabase />,
            description: "Joins, triggers, indexing, normalization & interview questions.",
            file: "https://drive.google.com/file/d/121Y7lax3QNLqf3DQVX1hhzc3tyvo1OKV/view?usp=sharing"
        },
        {
            title: "DSA Quick Notes",
            icon: <FaCode />,
            description: "Most important algorithms, patterns, and coding templates.",
            file: "/docs/dsa_notes.pdf"
        }
    ];

    const questions = [
        "Tell me about yourself.",
        "Why should we hire you?",
        "Describe a challenging situation you handled.",
        "What is your greatest strength?",
        "What is your biggest weakness?",
        "Explain a project you’re proud of.",
        "Where do you see yourself in 5 years?"
    ];

    const tips = [
        "Understand the company before the interview.",
        "Use STAR method for behavioral questions.",
        "Speak clearly and confidently.",
        "Pause before answering — think.",
        "Focus on problem-solving mindset.",
        "Ask meaningful questions to interviewer."
    ];

    return (
        <div className="interview-page">

            <h1 className="title">Interview Preparation Hub</h1>

            {/* DOCUMENT CARDS */}
            <h2 className="section-title"><FaFolderOpen /> Downloadable Notes</h2>
            <div className="docs-container">
                {docs.map((doc, idx) => (
                    <div className="doc-card" key={idx}>
                        <div className="icon">{doc.icon}</div>
                        <h2>{doc.title}</h2>
                        <p>{doc.description}</p>
                        <a href={doc.file} download className="download-btn">
                            Download
                        </a>
                    </div>
                ))}
            </div>

            {/* VIDEO SECTION */}
            <h2 className="section-title"><FaVideo /> Video Tutorials</h2>
            <div className="video-container">
                <iframe
                    src="https://www.youtube.com/embed/SqcY0GlETPk"
                    title="React JS Full Course"
                    allowfullscreen
                ></iframe>


                <iframe
                    src="https://www.youtube.com/embed/8hly31xKli0"
                    title="Python Interview Tips"
                    allowFullScreen
                ></iframe>

                <iframe
                    src="https://www.youtube.com/embed/IPvYjXCsTg8"
                    title="Computer Networks Full Course"
                    allowFullScreen
                ></iframe>

            </div>

            {/* COMMON QUESTIONS */}
            <h2 className="section-title"><FaQuestionCircle /> Common HR Questions</h2>
            <ul className="qa-list">
                {questions.map((q, i) => (
                    <li key={i}>{q}</li>
                ))}
            </ul>

            {/* TIPS */}
            <h2 className="section-title">🔥 Interview Tips</h2>
            <ul className="tips-list">
                {tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                ))}
            </ul>

        </div>
    );
}

export default InterviewPrep;
