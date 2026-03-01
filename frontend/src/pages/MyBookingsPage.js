/**
 * MyBookingsPage.js — Shows the current user's booking history.
 * Also displays in-app notifications.
 */
import React, { useEffect, useState } from "react";
import { getMyBookings, cancelBooking } from "../services/bookingService";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";

const STATUS_COLORS = {
    confirmed: "bg-green-900 text-green-300",
    pending: "bg-yellow-900 text-yellow-300",
    cancelled: "bg-gray-700 text-gray-400",
};

function MyBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    const fetchAll = async () => {
        try {
            const bookRes = await getMyBookings();
            setBookings(bookRes.data);
        } catch {
            setToast({ message: "Failed to load data.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleCancel = async (id) => {
        if (!window.confirm("Cancel this booking?")) return;
        try {
            await cancelBooking(id);
            setToast({ message: "Booking cancelled.", type: "success" });
            fetchAll();
        } catch {
            setToast({ message: "Failed to cancel booking.", type: "error" });
        }
    };

    if (loading) return <Spinner text="Loading your bookings..." />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-10">
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            <h1 className="text-3xl font-bold text-white mb-8">🎟️ My Bookings</h1>

            {/* Bookings Table */}
            {bookings.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-5xl mb-4">🎪</p>
                    <p className="text-gray-400 text-lg">No bookings yet.</p>
                    <a href="/" className="text-indigo-400 hover:underline mt-2 block">
                        Browse shows →
                    </a>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div
                            key={booking.id}
                            className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4"
                        >
                            <div>
                                <p className="text-white font-semibold text-lg">
                                    {booking.show_title || `Show #${booking.show_id}`}
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    📅 {booking.show_date} &nbsp;|&nbsp; 🕐 {booking.show_time}
                                </p>
                                <p className="text-gray-400 text-sm mt-1">
                                    💺 Seat <span className="text-white font-medium">{booking.seat_number}</span>
                                    <span className="text-indigo-400 ml-2 border border-indigo-700 rounded px-2 text-xs uppercase">{booking.payment_status}</span>
                                    &nbsp;|&nbsp; Booking #{booking.id}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                    Booked: {new Date(booking.booking_time).toLocaleString()}
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <span
                                    className={`text-xs px-3 py-1 rounded-full font-semibold ${STATUS_COLORS[booking.booking_status]
                                        }`}
                                >
                                    {booking.booking_status.toUpperCase()}
                                </span>

                                {booking.booking_status === "confirmed" && (
                                    <button
                                        id={`cancel-booking-${booking.id}`}
                                        onClick={() => handleCancel(booking.id)}
                                        className="text-xs text-red-400 hover:text-red-300 border border-red-700 px-3 py-1 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default MyBookingsPage;
