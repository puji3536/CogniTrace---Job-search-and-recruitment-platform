import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
    FaBell,
    FaCheckCircle,
    FaInfoCircle,
    FaExclamationTriangle,
    FaTimes
} from "react-icons/fa";

dayjs.extend(relativeTime);

function NotificationsDropdown() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [count, setCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("http://127.0.0.1:8000/notifications/unread/", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access")}`,
                },
            });

            const data = await res.json();
            setNotifications(data.notifications || []);
            setCount(data.count || 0);
        } catch (err) {
            console.log("Error:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markRead = async () => {
        await fetch("http://127.0.0.1:8000/notifications/mark-read/", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("access")}`,
            },
        });
        setCount(0);
    };

    const toggleDropdown = () => {
        const willOpen = !open;
        setOpen(willOpen);
        if (willOpen) markRead();
    };

    const closeDropdown = () => {
        setOpen(false);
    };

    const getIcon = (type) => {
        if (type === "success")
            return <FaCheckCircle size={18} style={{ color: "green" }} />;
        if (type === "warning")
            return <FaExclamationTriangle size={18} style={{ color: "orange" }} />;
        return <FaInfoCircle size={18} style={{ color: "blue" }} />;
    };

    return (
        <div style={{ position: "relative", display: "inline-block" }}>

            {/* Bell Icon */}
            <button
                onClick={toggleDropdown}
                className="icon"
                style={{
                    background: "none",
                    border: "none",
                    outline: "none",
                    padding: 0,           // FIX: remove padding so alignment matches
                    margin: 0,
                }}
            >
                <FaBell size={22} className="icon" />

                {count > 0 && (
                    <span className="notification-badge">{count}</span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div className="notification-dropdown-box animation-slide-down">

                    {/* Header */}
                    <div style={{
                        padding: "10px",
                        borderBottom: "1px solid #eee",
                        background: "#f7f7f7",
                        fontWeight: "600",
                        color: "#333",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <span>Notifications</span>

                        <FaTimes
                            size={18}
                            style={{ cursor: "pointer", color: "#444" }}
                            onClick={closeDropdown}
                        />
                    </div>

                    {notifications.length === 0 ? (
                        <p style={{ padding: "20px", textAlign: "center", color: "#777" }}>
                            No new notifications
                        </p>
                    ) : (
                        notifications.map((item) => (
                            <div
                                key={item.id}
                                className="notification-item"
                                onClick={() => {
                                    if (item.redirect_url) window.location.href = item.redirect_url;
                                }}
                            >
                                {getIcon(item.type)}

                                <div style={{ flex: 1 }}>
                                    <p className="notification-title">{item.message}</p>
                                    <p className="notification-time">
                                        {dayjs(item.created_at).fromNow()}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default NotificationsDropdown;
