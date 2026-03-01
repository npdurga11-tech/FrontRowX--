import React from "react";
import { Link } from "react-router-dom";

function NotFoundPage() {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-9xl font-black text-indigo-500 mb-4 opacity-80 animate-pulse">404</h1>
            <h2 className="text-3xl font-bold text-white mb-6">Page Not Found</h2>
            <p className="text-gray-400 mb-8 max-w-md">
                We couldn't find the page you were looking for. It might have been moved or the URL is incorrect.
            </p>
            <Link
                to="/"
                className="bg-indigo-600 font-bold text-white px-8 py-3 rounded-full hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30"
            >
                Return to Home
            </Link>
        </div>
    );
}

export default NotFoundPage;
