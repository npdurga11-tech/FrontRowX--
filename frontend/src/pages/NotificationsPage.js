import React, { useEffect, useState } from "react";
import { getNotifications, markAsRead } from "../services/notificationService";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";

function NotificationsPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const fetchNotifications = async () => {
        try {
            const notifRes = await getNotifications();
            setNotifications(notifRes.data);
        } catch {
            setToast({ message: "Failed to load notifications.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleMarkRead = async (notifId) => {
        try {
            await markAsRead(notifId);
            setNotifications((prev) =>
                prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
            );
        } catch { }
    };

    if (loading) return <Spinner text="Loading your notifications..." />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            <h1 className="text-3xl font-bold text-white mb-8">🔔 My Notifications</h1>

            {notifications.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-5xl mb-4">📭</p>
                    <p className="text-gray-400 text-lg">No notifications yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`flex items-start justify-between p-4 rounded-xl border ${n.is_read
                                ? "bg-gray-900 border-gray-800 opacity-60"
                                : "bg-indigo-900/30 border-indigo-600"
                                }`}
                        >
                            <p className="text-sm text-white">{n.message}</p>
                            {!n.is_read && (
                                <button
                                    onClick={() => handleMarkRead(n.id)}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 ml-4 whitespace-nowrap"
                                >
                                    Mark read
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default NotificationsPage;
