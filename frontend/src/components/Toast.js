/**
 * Toast.js — Simple inline toast notification component.
 * Shows success or error messages.
 */
import React from "react";

function Toast({ message, type = "success", onClose }) {
    if (!message) return null;

    const colorClass =
        type === "success"
            ? "bg-green-700 border-green-500"
            : "bg-red-800 border-red-600";

    return (
        <div
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-lg border text-white shadow-lg ${colorClass}`}
        >
            <span>{type === "success" ? "✅" : "❌"}</span>
            <span className="text-sm">{message}</span>
            <button
                onClick={onClose}
                className="ml-4 text-white/60 hover:text-white text-lg leading-none"
            >
                ×
            </button>
        </div>
    );
}

export default Toast;
