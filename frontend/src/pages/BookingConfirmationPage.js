import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

function BookingConfirmationPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // Extracted from navigate state
    const bookingDetails = location.state?.booking;

    if (!bookingDetails) {
        return (
            <div className="text-center py-20 text-white">
                <h2 className="text-2xl font-bold mb-4">No Booking Data Found</h2>
                <Link to="/" className="text-indigo-400 hover:text-indigo-300">
                    Return to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            <div className="bg-indigo-900 border border-indigo-600 rounded-3xl p-10 text-center shadow-2xl shadow-indigo-900/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none"></div>

                <div className="text-6xl mb-6 relative z-10 animate-bounce">🎉</div>
                <h2 className="text-4xl font-black text-white mb-2 relative z-10">Booking Confirmed!</h2>
                <p className="text-indigo-200 text-lg mb-8 relative z-10">
                    Your exclusive pass is ready. A confirmation email is on its way.
                </p>

                <div className="bg-gray-900 rounded-xl p-8 mb-8 inline-block text-left w-full max-w-lg border-2 border-dashed border-indigo-400/50 relative z-10 backdrop-blur-sm">
                    {/* Ticket Header */}
                    <div className="border-b border-gray-700/50 pb-5 mb-5 flex justify-between items-center">
                        <div>
                            <span className="text-indigo-400 text-sm font-bold tracking-wider uppercase">TICKET ID</span>
                            <div className="text-3xl font-black text-white font-mono tracking-widest mt-1">
                                {bookingDetails.ticket_code}
                            </div>
                        </div>
                        <div className="text-5xl opacity-80">🎟️</div>
                    </div>

                    {/* Ticket Details */}
                    <div className="grid grid-cols-2 gap-y-6">
                        <div>
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Pass Issued To</span>
                            <strong className="text-gray-100">{bookingDetails.attendee_name || "User"}</strong>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Amount Paid</span>
                            <strong className="text-green-400 bg-green-900/30 px-2 py-0.5 rounded border border-green-800/50">
                                ₹{bookingDetails.amount_paid}
                            </strong>
                        </div>

                        <div>
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Pass Type</span>
                            <strong className="text-white text-lg">{bookingDetails.seat_number.split('-')[0]} Pass</strong>
                        </div>
                        <div>
                            <span className="text-gray-500 text-xs font-bold uppercase tracking-wider block mb-1">Booking Date</span>
                            <strong className="text-gray-300">
                                {new Date(bookingDetails.booking_time).toLocaleDateString()}
                            </strong>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
                    <button
                        onClick={() => navigate("/my-bookings")}
                        className="px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 shadow-lg text-white font-bold transition-all"
                    >
                        View My Bookings
                    </button>
                    <Link
                        to="/"
                        className="px-8 py-4 rounded-xl border-2 border-indigo-500 text-indigo-300 hover:bg-indigo-900 hover:text-white transition-colors font-bold flex items-center justify-center"
                    >
                        Find More Events
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default BookingConfirmationPage;
