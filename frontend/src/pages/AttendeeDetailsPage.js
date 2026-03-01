import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Toast from "../components/Toast";

function AttendeeDetailsPage() {
    const { showId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Extracted from SeatSelectionPage navigate state
    const { lockedPassId, passType, price } = location.state || {};

    const [attendeeName, setAttendeeName] = useState(user?.name || "");
    const [attendeeEmail, setAttendeeEmail] = useState(user?.email || "");
    const [attendeePhone, setAttendeePhone] = useState("");
    const [toast, setToast] = useState(null);

    if (!lockedPassId) {
        return (
            <div className="text-center py-20 text-white">
                <h2 className="text-2xl font-bold mb-4">No Reserved Ticket Found</h2>
                <button
                    onClick={() => navigate(`/shows/${showId}/seats`)}
                    className="text-indigo-400 hover:text-indigo-300"
                >
                    Return to Selection
                </button>
            </div>
        );
    }

    const handleContinueToPayment = (e) => {
        e.preventDefault();
        if (!attendeeName.trim() || !attendeeEmail.trim()) {
            setToast({ message: "Name and Email are required.", type: "error" });
            return;
        }

        // Navigate to payment page with details
        navigate(`/shows/${showId}/payment`, {
            state: {
                lockedPassId,
                passType,
                price,
                attendeeDetails: {
                    attendee_name: attendeeName,
                    attendee_email: attendeeEmail,
                    attendee_phone: attendeePhone,
                }
            }
        });
    };

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <h1 className="text-3xl font-bold text-white mb-2 relative z-10">Attendees Details</h1>
                <p className="text-gray-400 mb-8 relative z-10">
                    Who will be using this <strong className="text-indigo-300">{passType}</strong> ticket?
                </p>

                <form onSubmit={handleContinueToPayment} className="space-y-6 relative z-10">
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Attendee Name *</label>
                        <input
                            type="text"
                            value={attendeeName}
                            onChange={(e) => setAttendeeName(e.target.value)}
                            placeholder="Full Name"
                            required
                            className="w-full bg-gray-800 border-2 border-gray-700 text-white px-5 py-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Attendee Email *</label>
                        <input
                            type="email"
                            value={attendeeEmail}
                            onChange={(e) => setAttendeeEmail(e.target.value)}
                            placeholder="Email address for the ticket delivery"
                            required
                            className="w-full bg-gray-800 border-2 border-gray-700 text-white px-5 py-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-2">The e-ticket will be sent exactly to this email.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Phone Number (Optional)</label>
                        <input
                            type="tel"
                            value={attendeePhone}
                            onChange={(e) => setAttendeePhone(e.target.value)}
                            placeholder="e.g. +1 234 567 8900"
                            className="w-full bg-gray-800 border-2 border-gray-700 text-white px-5 py-3 rounded-xl focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="pt-6 border-t border-gray-800 flex justify-between items-center">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl transition-transform active:scale-95 shadow-lg shadow-indigo-600/30"
                        >
                            Proceed to Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AttendeeDetailsPage;
