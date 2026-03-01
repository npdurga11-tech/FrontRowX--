import React, { useEffect, useState } from "react";
import { getTotalBookings, getShowSummary, getTotalRevenue } from "../services/reportService";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        total_confirmed_bookings: 0,
        total_revenue: 0,
        shows: []
    });
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/");
            return;
        }

        const fetchReports = async () => {
            try {
                const [bookingsRes, revenueRes, summaryRes] = await Promise.all([
                    getTotalBookings(),
                    getTotalRevenue(),
                    getShowSummary()
                ]);

                setStats({
                    total_confirmed_bookings: bookingsRes.data.total_confirmed_bookings,
                    total_revenue: revenueRes.data.total_revenue,
                    shows: summaryRes.data.shows
                });
            } catch (err) {
                setToast({ message: "Failed to load dashboard data.", type: "error" });
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [user, navigate]);

    if (loading) return <Spinner text="Loading dashboard..." />;

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">📊 Admin Dashboard</h1>
                    <p className="text-gray-400 mt-1">Platform overview and reports</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 border border-indigo-700 rounded-3xl p-8 flex flex-col justify-center items-center shadow-lg relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 text-indigo-500/20 text-9xl pointer-events-none">🎫</div>
                    <p className="text-indigo-200 text-lg font-medium mb-1 relative z-10">Total Confirmed Bookings</p>
                    <p className="text-white text-5xl font-bold relative z-10">{stats.total_confirmed_bookings}</p>
                </div>

                <div className="bg-gradient-to-br from-green-900 to-green-800 border border-green-700 rounded-3xl p-8 flex flex-col justify-center items-center shadow-lg relative overflow-hidden">
                    <div className="absolute -left-10 -bottom-10 text-green-500/20 text-9xl pointer-events-none">💰</div>
                    <p className="text-green-200 text-lg font-medium mb-1 relative z-10">Total Revenue</p>
                    <p className="text-white text-5xl font-bold relative z-10">₹{stats.total_revenue.toFixed(2)}</p>
                </div>
            </div>

            {/* Show Summary Table */}
            <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-xl overflow-hidden">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <span className="text-indigo-400">📅</span> Show Analytics
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="bg-gray-800 text-gray-400 uppercase text-xs border-b border-gray-700">
                            <tr>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Show</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Date</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider">Bookings / Capacity</th>
                                <th scope="col" className="px-6 py-4 font-semibold tracking-wider text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {stats.shows.map((show) => {
                                const occupancyPercentage = show.total_seats > 0
                                    ? Math.round((show.confirmed_bookings / show.total_seats) * 100)
                                    : 0;

                                return (
                                    <tr key={show.show_id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">
                                            {show.show_title}
                                        </td>
                                        <td className="px-6 py-4">
                                            {show.show_date}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span>{show.confirmed_bookings} / {show.total_seats}</span>
                                                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${occupancyPercentage >= 80 ? 'bg-green-500' : occupancyPercentage >= 50 ? 'bg-yellow-500' : 'bg-indigo-500'}`}
                                                        style={{ width: `${occupancyPercentage}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-xs font-bold text-gray-400 w-8 text-right">{occupancyPercentage}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-green-400">
                                            ₹{show.revenue?.toFixed(2) || '0.00'}
                                        </td>
                                    </tr>
                                );
                            })}

                            {stats.shows.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                        No shows available to analyze.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
