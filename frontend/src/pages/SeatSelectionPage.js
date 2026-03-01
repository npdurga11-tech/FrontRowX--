/**
 * SeatSelectionPage.js — Ticket Pass Selection for chosen show.
 *
 * Flow:
 *  1. Renders Pass Options (VIP, Balcony, GA)
 *  2. User clicks a pass → lock API call with random unique identifier
 *  3. User clicks Confirm → booking API call → success toast
 */
import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getShow } from "../services/showService";
import { lockSeat, confirmBooking } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";

function SeatSelectionPage() {
    const { showId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [show, setShow] = useState(null);
    const [loading, setLoading] = useState(true);

    const [selectedPass, setSelectedPass] = useState(null);
    const [lockedPassId, setLockedPassId] = useState(null);
    const [confirming, setConfirming] = useState(false);
    const [locking, setLocking] = useState(false);
    const [toast, setToast] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const showRes = await getShow(showId);
            setShow(showRes.data);
        } catch {
            setToast({ message: "Failed to load event data.", type: "error" });
        } finally {
            setLoading(false);
        }
    }, [showId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSelectPass = async (passType) => {
        if (!user) {
            navigate("/login");
            return;
        }

        if (show.available_seats <= 0) {
            setToast({ message: "Sorry, this event is completely sold out.", type: "error" });
            return;
        }

        setSelectedPass(passType);
        setLocking(true);

        // Generate a random unique pass ID for the backend to "lock" (Must be under 10 chars for DB constraint)
        let prefix = "GEN";
        if (passType === "VIP Pass") prefix = "VIP";
        if (passType === "Front Balcony") prefix = "BAL";
        const uniquePassId = `${prefix}-${Math.floor(Math.random() * 90000) + 10000}`;

        try {
            // Lock the virtual "seat"
            await lockSeat({ show_id: Number(showId), seat_number: uniquePassId });
            setLockedPassId(uniquePassId);
            setToast({ message: `${passType} reserved! Confirm within 2 minutes.`, type: "success" });
        } catch (err) {
            const msg = err.response?.data?.detail || "Could not reserve pass at this moment.";
            setToast({ message: msg, type: "error" });
            setSelectedPass(null);
            setLockedPassId(null);
        } finally {
            setLocking(false);
        }
    };

    const handleContinue = () => {
        if (!lockedPassId) return;

        // Route to the new attendee details page instead of booking directly
        const passPrice = Math.round(show.ticket_price * PASS_TYPES.find(p => p.name === selectedPass).multiplier);
        navigate(`/shows/${showId}/attendee`, {
            state: {
                lockedPassId,
                passType: selectedPass,
                price: passPrice
            }
        });
    };

    if (loading) return <Spinner text="Loading event details..." />;
    if (!show) return <p className="text-center text-red-400 py-20">Event not found.</p>;

    const PASS_TYPES = [
        {
            name: "VIP Pass",
            multiplier: 2.0,
            features: ["Front row access", "Meet & Greet", "Free beverages", "Priority Entry"],
            color: "from-yellow-600 to-yellow-400",
            border: "border-yellow-500",
            icon: "👑"
        },
        {
            name: "Front Balcony",
            multiplier: 1.5,
            features: ["Elevated perfect view", "Comfortable seating", "Dedicated bar access"],
            color: "from-indigo-600 to-indigo-400",
            border: "border-indigo-500",
            icon: "🔭"
        },
        {
            name: "General Area",
            multiplier: 1.0,
            features: ["Ground access", "High energy zone", "Near food stalls"],
            color: "from-green-600 to-green-400",
            border: "border-green-500",
            icon: "🕺"
        }
    ];

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            {/* Event Info Header */}
            <div className="mb-10 bg-gray-900 border border-gray-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl">
                <div className="absolute -right-10 -top-10 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <button
                    onClick={() => navigate("/")}
                    className="text-indigo-400 hover:text-indigo-300 text-sm mb-4 inline-flex items-center gap-2 transition-colors relative z-10"
                >
                    ← Back to Events
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
                    <div>
                        <span className="text-xs px-3 py-1 font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 uppercase tracking-wider mb-3 inline-block">
                            {show.category}
                        </span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">{show.title}</h1>
                        <p className="text-lg text-gray-400 flex items-center gap-2">
                            📍 {show.venue_name}, <strong className="text-white">{show.location}</strong>
                        </p>
                    </div>
                    <div className="text-right bg-gray-800/80 p-4 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                        <p className="text-gray-300 text-sm mb-1 uppercase tracking-wider font-semibold">Event Schedule</p>
                        <p className="text-white font-bold text-lg">
                            {new Date(show.show_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                        </p>
                        <p className="text-indigo-400 font-bold">{show.show_time.substring(0, 5)}</p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-800 flex flex-wrap gap-8">
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Availability</span>
                        <span className={`text-lg font-bold ${show.available_seats < 20 ? 'text-red-400' : 'text-green-400'}`}>
                            {show.available_seats} Passes Left
                        </span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-500 text-xs uppercase font-bold tracking-wider">Base Price</span>
                        <span className="text-lg font-bold text-white">₹{show.ticket_price}</span>
                    </div>
                </div>
            </div>

            {/* Content Switcher: Selection vs Confirmation */}
            {!lockedPassId ? (
                <>
                    <h2 className="text-2xl font-bold text-white mb-6">Select Your Experience</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {PASS_TYPES.map((pass) => (
                            <div
                                key={pass.name}
                                className={`bg-gray-900 border-2 ${selectedPass === pass.name ? pass.border : 'border-gray-800'} rounded-3xl p-6 hover:border-gray-600 transition-all flex flex-col h-full hover:-translate-y-1 shadow-xl relative overflow-hidden group`}
                            >
                                {/* Gradient Header background */}
                                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${pass.color}`}></div>

                                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform origin-left">{pass.icon}</div>
                                <h3 className="text-2xl font-bold text-white mb-1">{pass.name}</h3>
                                <p className="text-3xl font-black text-white mb-6">
                                    <span className="text-sm text-gray-500 font-medium mr-1">₹</span>
                                    {Math.round(show.ticket_price * pass.multiplier)}
                                </p>

                                <ul className="space-y-3 mb-8 flex-grow">
                                    {pass.features.map((feature, i) => (
                                        <li key={i} className="text-gray-400 text-sm flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5">✓</span>
                                            {feature}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSelectPass(pass.name)}
                                    disabled={locking || show.available_seats <= 0}
                                    className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${show.available_seats <= 0
                                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                                        : `bg-gradient-to-r ${pass.color} hover:shadow-2xl hover:brightness-110 active:scale-95`
                                        }`}
                                >
                                    {locking && selectedPass === pass.name ? "Reserving..." :
                                        show.available_seats <= 0 ? "Sold Out" : "Select Pass"}
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                /* Booking confirmation panel */
                <div className="bg-indigo-900 border border-indigo-600 rounded-3xl p-10 text-center shadow-2xl shadow-indigo-900/50 max-w-2xl mx-auto relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                    <div className="text-6xl mb-6 relative z-10">🎫</div>
                    <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Review Your Booking</h2>
                    <p className="text-indigo-200 text-lg mb-8 relative z-10">
                        You have reserved 1x <strong className="text-white">{selectedPass}</strong> for {show.title}.
                    </p>

                    <div className="bg-gray-900/50 rounded-xl p-6 mb-8 inline-block text-left min-w-[300px] border border-indigo-800/50 relative z-10 backdrop-blur-sm">
                        <div className="flex justify-between border-b border-gray-700/50 pb-3 mb-3">
                            <span className="text-gray-400">Pass Type</span>
                            <span className="text-white font-bold">{selectedPass}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-700/50 pb-3 mb-3">
                            <span className="text-gray-400">Amount to pay</span>
                            <span className="text-green-400 font-bold">
                                ₹{Math.round(show.ticket_price * PASS_TYPES.find(p => p.name === selectedPass).multiplier)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Timer</span>
                            <span className="text-yellow-400 font-bold animate-pulse">⏱ Lock expires in 2m</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                        <button
                            onClick={() => {
                                setLockedPassId(null);
                                setSelectedPass(null);
                            }}
                            className="px-8 py-4 rounded-xl border border-indigo-500 text-indigo-300 hover:bg-indigo-800 hover:text-white transition-colors font-bold"
                            disabled={confirming}
                        >
                            Cancel & Go Back
                        </button>
                        <button
                            id="confirm-booking-btn"
                            onClick={handleContinue}
                            disabled={confirming}
                            className="bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white font-bold px-12 py-4 rounded-xl transition-all shadow-lg shadow-green-900/50 hover:-translate-y-1 transform"
                        >
                            {confirming ? "Loading..." : "✅ Continue to Checkout"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SeatSelectionPage;
