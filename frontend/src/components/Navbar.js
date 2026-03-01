/**
 * Navbar.js — Top navigation bar.
 * Shows different links based on auth state.
 */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getNotifications } from "../services/notificationService";

function Navbar() {
    const { user, logoutUser } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread notification count if logged in
    useEffect(() => {
        if (!user) return;
        getNotifications()
            .then((res) => {
                const unread = res.data.filter((n) => !n.is_read).length;
                setUnreadCount(unread);
            })
            .catch(() => { });
    }, [user]);

    const handleLogout = () => {
        logoutUser();
        navigate("/login");
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
            <div className="max-w-6xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-2xl font-bold text-indigo-400 hover:text-indigo-300">
                    🎭 FrontRowX
                </Link>

                {/* Navigation links */}
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-gray-300 hover:text-white transition-colors">
                        Shows
                    </Link>

                    {user ? (
                        <>
                            <Link
                                to="/my-bookings"
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                My Bookings
                            </Link>

                            {/* Notification bell */}
                            <Link to="/notifications" className="relative text-gray-300 hover:text-white">
                                🔔
                                {unreadCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {unreadCount}
                                    </span>
                                )}
                            </Link>

                            {user.role === "admin" && (
                                <Link
                                    to="/admin"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    Dashboard
                                </Link>
                            )}

                            <span className="text-gray-400 text-sm">
                                Hi, <span className="text-white">{user.name}</span>
                                {user.role === "admin" && (
                                    <span className="ml-1 text-yellow-400 text-xs">(Admin)</span>
                                )}
                            </span>

                            <button
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-lg transition-colors"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
