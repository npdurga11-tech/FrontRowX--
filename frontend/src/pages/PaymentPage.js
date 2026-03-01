import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { confirmBooking } from "../services/bookingService";
import Toast from "../components/Toast";
import Spinner from "../components/Spinner";

function PaymentPage() {
    const { showId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Extracted from navigate state
    const { lockedPassId, passType, price, attendeeDetails } = location.state || {};

    const [processing, setProcessing] = useState(false);
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

    const handlePayment = async () => {
        setProcessing(true);

        try {
            const bookingData = {
                show_id: Number(showId),
                seat_number: lockedPassId,
                ...attendeeDetails
            };

            const result = await confirmBooking(bookingData);

            setToast({ message: `🎉 Payment successful! Redirecting...`, type: "success" });

            // Wait a moment then navigate to confirmation page, passing the specific booking info
            setTimeout(() => {
                navigate(`/shows/${showId}/booking-confirmation`, {
                    state: { booking: result.data }
                });
            }, 1500);

        } catch (err) {
            const msg = err.response?.data?.detail || "Payment processing failed.";
            setToast({ message: msg, type: "error" });
            setProcessing(false);
        }
    };

    if (processing) return <Spinner text="Processing secure payment..." />;

    return (
        <div className="max-w-3xl mx-auto px-4 py-10">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/10 rounded-full blur-3xl pointer-events-none"></div>

                <h1 className="text-3xl font-bold text-white mb-6 relative z-10">Secure Payment</h1>

                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8 relative z-10">
                    <h3 className="text-lg text-gray-300 mb-4 font-semibold border-b border-gray-700 pb-2">Order Summary</h3>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Pass Type</span>
                        <span className="text-white font-bold">{passType}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Attendee Name</span>
                        <span className="text-white">{attendeeDetails.attendee_name}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Email</span>
                        <span className="text-white">{attendeeDetails.attendee_email}</span>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                        <span className="text-gray-300 font-bold text-lg">Total Amount</span>
                        <span className="text-2xl text-green-400 font-bold">₹{price}</span>
                    </div>
                </div>

                <div className="space-y-4 mb-8 relative z-10">
                    <div className="bg-gray-800 border border-indigo-500 p-4 rounded-xl flex items-start gap-4 cursor-pointer relative overflow-hidden">
                        <div className="flex-shrink-0 mt-1">
                            <span className="bg-indigo-500 w-4 h-4 rounded-full inline-block border-4 border-gray-800 shadow-[0_0_0_2px_#6366f1]"></span>
                        </div>
                        <div>
                            <p className="font-bold text-white">Mocked Payment Method</p>
                            <p className="text-gray-400 text-sm">Simulates a credit card transaction instantly.</p>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-gray-800 flex justify-between items-center relative z-10">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-400 hover:text-white transition-colors"
                        disabled={processing}
                    >
                        Go Back
                    </button>
                    <button
                        onClick={handlePayment}
                        disabled={processing}
                        className="bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-8 rounded-xl transition-transform active:scale-95 shadow-lg shadow-green-600/30 flex items-center justify-center min-w-[200px]"
                    >
                        Pay ₹{price}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentPage;
