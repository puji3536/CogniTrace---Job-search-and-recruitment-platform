import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdRecordVoiceOver } from "react-icons/md";

import {
    FaHome,
    FaFileAlt,
    FaClipboardCheck,
    FaLightbulb,
    FaUserCircle,
    FaUserEdit,
    FaSignOutAlt,
    FaQuestionCircle
} from "react-icons/fa";

import NotificationsDropdown from "./NotificationsDropdown";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const [user, setUser] = useState({ full_name: "", email: "" });

    const isLoggedIn = !!localStorage.getItem("access");

    useEffect(() => {
        const updateUser = () => {
            const full_name = localStorage.getItem("full_name");
            const email = localStorage.getItem("email");
            setUser({ full_name: full_name || "", email: email || "" });
        };
        updateUser();
        window.addEventListener("storage", updateUser);
        return () => window.removeEventListener("storage", updateUser);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    if (!isLoggedIn) return null;

    return (
        <>
            {/* SIDEBAR */}
            <aside className="sidebar">
                <div className="logo" onClick={() => navigate("/home")}>
                    <b>CogniTrace</b>
                </div>

                <ul className="sidebar-links">
                    <li><Link to="/home"><FaHome /> Home</Link></li>
                    <li><Link to="/resume"><FaFileAlt /> Resume</Link></li>
                    <li><Link to="/assessments"><FaClipboardCheck /> Assessments</Link></li>
                    <li><Link to="/skills"><FaLightbulb /> Skills</Link></li>
                </ul>

                <div className="sidebar-bottom">
                    <div className="user-info">
                        <FaUserCircle size={38} style={{ marginBottom: "8px" }} />
                        <div>{user.full_name || "Guest"}</div>
                        <small>{user.email || "example@mail.com"}</small>
                    </div>
                    <Link to="/support" className="help-link">
                        <FaQuestionCircle /> Help
                    </Link>
                </div>
            </aside>

            {/* TOPBAR */}
            <header className="topbar">
                <div className="topbar-icons">
                    <div className="icon" onClick={() => navigate("/interview")}>
                        <MdRecordVoiceOver size={22} title="Interview Prep" />
                    </div>
                    <div className="icon" style={{ position: "relative" }}>
                        <NotificationsDropdown />
                    </div>
                    <div
                        className="profile-icon"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <FaUserCircle size={26} />
                        {showProfileMenu && (
                            <div className="profile-dropdown">
                                <button onClick={() => navigate("/edit-profile")}>
                                    <FaUserEdit /> Edit Details
                                </button>
                                <button onClick={handleLogout}>
                                    <FaSignOutAlt /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>
        </>
    );
}

export default Navbar;