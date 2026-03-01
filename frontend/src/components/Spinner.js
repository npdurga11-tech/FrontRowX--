/**
 * Spinner.js — Loading spinner component.
 */
import React from "react";

function Spinner({ text = "Loading..." }) {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-400 text-sm">{text}</p>
        </div>
    );
}

export default Spinner;
