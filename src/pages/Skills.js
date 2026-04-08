import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Skills.css";

function getStrength(skill) {
    if (skill.verified) {
        return { label: "Advanced", cls: "strength-advanced", width: "100%", color: "#22c55e" };
    } else if (skill.certificate) {
        return { label: "Intermediate", cls: "strength-intermediate", width: "60%", color: "#f59e0b" };
    } else {
        return { label: "Beginner", cls: "strength-beginner", width: "25%", color: "#94a3b8" };
    }
}

function Skills() {
    const [skill, setSkill] = useState("");
    const [skills, setSkills] = useState([]);
    const [popupMsg, setPopupMsg] = useState("");
    const navigate = useNavigate();
    const fileInputRefs = useRef({});

    const getAccessToken = () => localStorage.getItem("access");
    const getRefreshToken = () => localStorage.getItem("refresh");

    const refreshAccessToken = async () => {
        const refresh = getRefreshToken();
        if (!refresh) { logoutUser(); throw new Error("No refresh token"); }
        try {
            const res = await axios.post("http://localhost:8000/token/refresh/", { refresh });
            localStorage.setItem("access", res.data.access);
            return res.data.access;
        } catch (err) { logoutUser(); throw err; }
    };

    const logoutUser = () => { localStorage.clear(); navigate("/login"); };

    const apiCallWithRefresh = async (axiosRequest) => {
        try {
            return await axiosRequest();
        } catch (error) {
            if (error.response && error.response.status === 401) {
                const newToken = await refreshAccessToken();
                return await axiosRequest(newToken);
            }
            throw error;
        }
    };

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const response = await apiCallWithRefresh((token) =>
                    axios.get("http://localhost:8000/skills/", {
                        headers: { Authorization: `Bearer ${token || getAccessToken()}` },
                    })
                );
                setSkills(response.data);
            } catch (err) { console.error("Skill fetch error:", err); }
        };
        fetchSkills();
    }, []);

    const handleAddSkill = async () => {
        const trimmedSkill = skill.trim();
        if (!trimmedSkill) return;
        try {
            const response = await apiCallWithRefresh((token) =>
                axios.post("http://localhost:8000/skills/add/", { name: trimmedSkill },
                    { headers: { Authorization: `Bearer ${token || getAccessToken()}` } })
            );
            setSkills((prev) => [...prev, response.data]);
            setSkill("");
        } catch (err) { alert(err.response?.data?.error || "Skill could not be added"); }
    };

    const handleRemoveSkill = async (id) => {
        try {
            await apiCallWithRefresh((token) =>
                axios.delete(`http://localhost:8000/skills/delete/${id}/`, {
                    headers: { Authorization: `Bearer ${token || getAccessToken()}` },
                })
            );
            setSkills((prev) => prev.filter((s) => s.id !== id));
        } catch (err) { console.error("Delete error:", err); }
    };

    const handleFileChange = async (e, skillId) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("verification_file", file);
        try {
            await apiCallWithRefresh((token) =>
                axios.post(`http://localhost:8000/skills/upload/${skillId}/`, formData, {
                    headers: {
                        Authorization: `Bearer ${token || getAccessToken()}`,
                        "Content-Type": "multipart/form-data",
                    },
                })
            );
            setPopupMsg("Certificate uploaded!");
            setTimeout(() => setPopupMsg(""), 2500);
            const response = await axios.get("http://localhost:8000/skills/", {
                headers: { Authorization: `Bearer ${getAccessToken()}` },
            });
            setSkills(response.data);
        } catch (err) { alert("File upload failed."); }
    };

    const triggerFileUpload = (skillId) => {
        fileInputRefs.current[skillId].value = "";
        fileInputRefs.current[skillId].click();
    };

    const handleVerifySkill = () => navigate("/assessments");

    // Summary counts
    const advancedCount = skills.filter(s => s.verified).length;
    const intermediateCount = skills.filter(s => !s.verified && s.certificate).length;
    const beginnerCount = skills.filter(s => !s.verified && !s.certificate).length;

    return (
        <div className="content">
            {popupMsg && <div className="popup-success">{popupMsg}</div>}

            <div className="skills-container">
                <h2 className="skills-title">My Skills</h2>

                {/* Strength summary bar */}
                {skills.length > 0 && (
                    <div className="strength-summary">
                        <div className="strength-summary-item">
                            <span className="strength-dot" style={{ background: "#22c55e" }}></span>
                            <span>Advanced <b>{advancedCount}</b></span>
                        </div>
                        <div className="strength-summary-item">
                            <span className="strength-dot" style={{ background: "#f59e0b" }}></span>
                            <span>Intermediate <b>{intermediateCount}</b></span>
                        </div>
                        <div className="strength-summary-item">
                            <span className="strength-dot" style={{ background: "#94a3b8" }}></span>
                            <span>Beginner <b>{beginnerCount}</b></span>
                        </div>
                    </div>
                )}

                <div className="instructions-box">
                    <p><strong>1.</strong> No certificate? Click <b>Verify</b> to take an assessment.</p>
                    <p><strong>2.</strong> Have a certificate? Click <b>Upload Certificate</b> to submit it.</p>
                    <p><strong>3.</strong> To remove a skill, use the <b>Remove</b> button.</p>
                </div>

                <div className="input-section">
                    <input
                        type="text"
                        placeholder="Enter a skill (e.g., React, SQL)"
                        value={skill}
                        onChange={(e) => setSkill(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                        className="skill-input"
                    />
                    <button onClick={handleAddSkill} className="save-btn">Save</button>
                </div>

                <div className="skills-list">
                    {skills.map((s) => {
                        const strength = getStrength(s);
                        return (
                            <div key={s.id} className="skill-card">

                                {/* Name + strength badge */}
                                <div className="skill-name-row">
                                    <span className="skill-name">{s.name}</span>
                                    <span className={`strength-badge ${strength.cls}`}>
                                        {strength.label}
                                    </span>
                                </div>

                                {/* Strength progress bar */}
                                <div className="strength-bar-wrap">
                                    <div
                                        className="strength-bar-fill"
                                        style={{ width: strength.width, background: strength.color }}
                                    />
                                </div>

                                {/* Status + actions */}
                                {s.verified ? (
                                    <p className="verified-text">🎖️ Verified Skill</p>
                                ) : (
                                    <>
                                        {s.certificate && (
                                            <p className="pending-text">⏳ Certificate uploaded — pending verification</p>
                                        )}

                                        <div className="skill-actions">
                                            {!s.certificate && (
                                                <>
                                                    <button onClick={() => triggerFileUpload(s.id)} className="upload-btn">
                                                        Upload Certificate
                                                    </button>
                                                    <input
                                                        type="file"
                                                        ref={(el) => (fileInputRefs.current[s.id] = el)}
                                                        style={{ display: "none" }}
                                                        onChange={(e) => handleFileChange(e, s.id)}
                                                    />
                                                    <button onClick={handleVerifySkill} className="verify-btn">
                                                        Verify
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => handleRemoveSkill(s.id)} className="remove-btn">
                                                Remove
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {skills.length === 0 && (
                    <p className="empty-msg">No skills added yet. Add one above.</p>
                )}
            </div>
        </div>
    );
}

export default Skills;