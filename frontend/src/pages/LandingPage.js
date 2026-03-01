import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
    return (
        <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center relative overflow-hidden text-center px-4">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-6 drop-shadow-xl z-10 animate-fade-in-up">
                FrontRowX
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl z-10 font-light">
                Secure your spot at the hottest shows, concerts, and festivals. Experience the VIP lifestyle instantly.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 z-10">
                <Link
                    to="/shows"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg px-10 py-5 rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all shadow-lg shadow-indigo-500/30"
                >
                    Explore Events
                </Link>
                <Link
                    to="/my-bookings"
                    className="border border-indigo-500/50 bg-gray-900/50 text-indigo-300 font-bold text-lg px-10 py-5 rounded-full hover:bg-indigo-900/50 hover:text-white transition-all backdrop-blur-sm"
                >
                    My Passes
                </Link>
            </div>

            {/* Features section mimicking Flight Booking landing */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-5xl px-4 z-10">
                <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 backdrop-blur">
                    <div className="text-3xl mb-3">🎫</div>
                    <h3 className="text-xl font-bold text-white mb-2">Instant Ticketing</h3>
                    <p className="text-gray-400">Get your unique ticket code and PNR generated instantly upon booking.</p>
                </div>
                <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 backdrop-blur">
                    <div className="text-3xl mb-3">🤝</div>
                    <h3 className="text-xl font-bold text-white mb-2">Book for Friends</h3>
                    <p className="text-gray-400">Specify attendee details separate from your account information.</p>
                </div>
                <div className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 backdrop-blur">
                    <div className="text-3xl mb-3">🔒</div>
                    <h3 className="text-xl font-bold text-white mb-2">Secure Payments</h3>
                    <p className="text-gray-400">Your price is locked in for the ultimate payment convenience.</p>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
