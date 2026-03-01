/**
 * ShowsPage.js — Lists all available shows.
 * Admins also see a "Create Show" form at the top.
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getShows, createShow } from "../services/showService";
import { useAuth } from "../context/AuthContext";
import Spinner from "../components/Spinner";
import Toast from "../components/Toast";

const POPULAR_CITIES = [
    { name: "Mumbai", icon: "🎬" },
    { name: "Bangalore", icon: "🏙️" },
    { name: "Delhi NCR", icon: "🏛️" },
    { name: "Pune", icon: "⛰️" },
    { name: "Hyderabad", icon: "🥘" },
    { name: "Chennai", icon: "🏖️" },
    { name: "Kolkata", icon: "🚋" },
    { name: "Goa", icon: "⛱️" },
    { name: "Ahmedabad", icon: "🏜️" },
    { name: "Chandigarh", icon: "🛣️" },
    { name: "Jaipur", icon: "🏰" },
    { name: "Kochi", icon: "🌴" }
];

function ShowsPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [shows, setShows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [filterCategory, setFilterCategory] = useState("ALL");
    const [selectedCity, setSelectedCity] = useState(null);

    // Filter by city first, then by category
    const filteredShows = shows.filter(show =>
        (selectedCity ? (show.location.toLowerCase() === selectedCity.toLowerCase()) : false) &&
        (filterCategory === "ALL" || show.category === filterCategory)
    );

    // Extract available cities starting from API
    const availableCities = [...new Set(shows.map(s => s.location))];

    // Admin create-show form state
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        title: "",
        category: "concert",
        description: "",
        location: "",
        venue_name: "",
        show_date: "",
        show_time: "",
        total_seats: 100,
        rows_count: 10,
        seats_per_row: 10,
        ticket_price: 50.0,
    });
    const [creating, setCreating] = useState(false);

    const fetchShows = async () => {
        try {
            const res = await getShows();
            setShows(res.data);
        } catch {
            setToast({ message: "Failed to load shows.", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShows();
    }, []);

    const handleFormChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreateShow = async (e) => {
        e.preventDefault();
        setCreating(true);
        try {
            await createShow({
                ...form,
                total_seats: Number(form.rows_count) * Number(form.seats_per_row),
                rows_count: Number(form.rows_count),
                seats_per_row: Number(form.seats_per_row),
                ticket_price: Number(form.ticket_price),
            });
            setToast({ message: "Show created successfully!", type: "success" });
            setShowForm(false);
            fetchShows();
        } catch (err) {
            setToast({ message: err.response?.data?.detail || "Failed to create show.", type: "error" });
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <Spinner text="Loading events..." />;

    // Step 1: City Selection
    if (!selectedCity && user?.role !== "admin") {
        return (
            <div className="max-w-6xl mx-auto px-4 py-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Where do you want to go?</h1>
                    <p className="text-gray-400">Select a city to discover live concerts, magic shows, and events near you.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {POPULAR_CITIES.map((city) => (
                        <div
                            key={city.name}
                            onClick={() => setSelectedCity(city.name)}
                            className="bg-gray-900 border border-gray-800 hover:border-indigo-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-900/30 group"
                        >
                            <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">{city.icon}</span>
                            <span className="text-white font-medium text-lg">{city.name}</span>
                            {availableCities.includes(city.name) ? (
                                <span className="text-xs text-green-400 mt-2 font-semibold bg-green-900/30 px-2 py-1 rounded">Live Shows</span>
                            ) : (
                                <span className="text-xs text-gray-500 mt-2">No shows yet</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Step 2: Shows Listing (or Admin view bypasses city selection)
    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            {toast && (
                <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div>
                    {!user?.role || user?.role !== "admin" ? (
                        <>
                            <button
                                onClick={() => setSelectedCity(null)}
                                className="text-indigo-400 hover:text-indigo-300 text-sm mb-4 flex items-center gap-1 font-medium transition-colors"
                            >
                                ← Change City
                            </button>
                            <h1 className="text-3xl font-bold text-white">🎭 Live Shows in {selectedCity}</h1>
                        </>
                    ) : (
                        <h1 className="text-3xl font-bold text-white">🎭 All Live Shows (Admin)</h1>
                    )}
                </div>

                {user?.role === "admin" && (
                    <button
                        id="toggle-create-show"
                        onClick={() => setShowForm(!showForm)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg transition-colors font-semibold"
                    >
                        {showForm ? "Cancel" : "+ Add Show"}
                    </button>
                )}
            </div>

            {/* Admin Create Show Form */}
            {user?.role === "admin" && showForm && (
                <div className="bg-gray-900 border border-gray-700 rounded-3xl p-8 mb-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                    <h2 className="text-xl font-bold text-white mb-6 relative">Create New Live Show</h2>
                    <form onSubmit={handleCreateShow} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
                        <div>
                            <label className="text-sm font-medium text-gray-400">Title *</label>
                            <input name="title" value={form.title} onChange={handleFormChange} required className="w-full mt-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400">Category *</label>
                            <select name="category" value={form.category} onChange={handleFormChange} required className="w-full mt-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow">
                                <option value="concert">Concert</option>
                                <option value="comedy">Comedy</option>
                                <option value="theatre">Theatre</option>
                                <option value="festival">Festival</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400">Venue Name *</label>
                            <input name="venue_name" value={form.venue_name} onChange={handleFormChange} required className="w-full mt-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-sm font-medium text-gray-400">Description</label>
                            <textarea name="description" value={form.description} onChange={handleFormChange} rows={2} className="w-full mt-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400">Location (City) *</label>
                            <input name="location" value={form.location} onChange={handleFormChange} required className="w-full mt-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400">Date *</label>
                            <input type="date" name="show_date" value={form.show_date} onChange={handleFormChange} required className="w-full mt-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400">Time *</label>
                            <input type="time" name="show_time" value={form.show_time} onChange={handleFormChange} required className="w-full mt-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" />
                        </div>

                        {/* Passes & Pricing (mocked as rows/seats back to original schema to keep backend simple) */}
                        <div>
                            <label className="text-sm font-medium text-gray-400">Total VIP Passes Tracking (Rows * Seats)</label>
                            <div className="flex gap-2 mt-1">
                                <input name="rows_count" type="number" min="1" value={form.rows_count} onChange={handleFormChange} required className="w-1/2 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Rows" />
                                <input name="seats_per_row" type="number" min="1" value={form.seats_per_row} onChange={handleFormChange} required className="w-1/2 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Per Row" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-400">Base Ticket Price (₹) *</label>
                            <input name="ticket_price" type="number" step="0.01" min="0" value={form.ticket_price} onChange={handleFormChange} required className="w-full mt-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow" />
                        </div>

                        <div className="md:col-span-3 flex justify-end mt-6">
                            <button
                                type="submit"
                                disabled={creating}
                                className="bg-green-600 hover:bg-green-500 disabled:opacity-60 text-white px-8 py-3 rounded-xl transition-all shadow-lg shadow-green-900/50 hover:-translate-y-1 font-bold"
                            >
                                {creating ? "Creating..." : "Create Show"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter */}
            <div className="mb-8 flex justify-between items-center bg-gray-900 border border-gray-800 p-4 rounded-xl shadow-md">
                <span className="text-gray-400 font-medium">Filter Category:</span>
                <select
                    className="bg-gray-800 border border-gray-700 text-white font-medium rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
                    onChange={(e) => setFilterCategory(e.target.value)}
                    value={filterCategory}
                >
                    <option value="ALL">All Events</option>
                    <option value="concert">Concerts</option>
                    <option value="comedy">Comedy</option>
                    <option value="theatre">Theatre</option>
                    <option value="festival">Festivals</option>
                </select>
            </div>

            {/* Show Results */}
            {filteredShows.length === 0 && (!user || user.role !== "admin") ? (
                <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-3xl shadow-lg">
                    <p className="text-6xl mb-6">🎟️</p>
                    <p className="text-gray-300 text-xl font-medium">No live shows available in {selectedCity} right now.</p>
                    <p className="text-gray-500 mt-2">Check back later or try another city!</p>
                </div>
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(user?.role === "admin" ? shows : filteredShows).map((show) => (
                    <div
                        key={show.id}
                        className="bg-gray-900 relative overflow-hidden border border-gray-800 rounded-3xl p-6 hover:border-indigo-500 transition-all hover:shadow-2xl hover:shadow-indigo-900/30 cursor-pointer group hover:-translate-y-1 block"
                        onClick={() => navigate(`/shows/${show.id}/seats`)}
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150"></div>

                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <h2 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{show.title}</h2>
                            <span className="text-[10px] px-3 py-1 font-bold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 uppercase tracking-wider">
                                {show.category}
                            </span>
                        </div>

                        {show.description && (
                            <p className="text-gray-400 text-sm mb-5 line-clamp-2 relative z-10">{show.description}</p>
                        )}

                        <div className="space-y-3 text-sm text-gray-300 relative bg-gray-800/50 p-4 rounded-xl border border-gray-700/50 z-10">
                            <p className="flex items-start gap-3">
                                <span className="text-lg">📍</span>
                                <span className="font-medium leading-tight">{show.venue_name}<br /><span className="text-gray-500 font-normal break-words">{show.location}</span></span>
                            </p>
                            <p className="flex items-center gap-3">
                                <span className="text-lg">📅</span>
                                <span className="font-medium">{new Date(show.show_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {show.show_time.substring(0, 5)}</span>
                            </p>
                            <p className="flex items-center gap-3">
                                <span className="text-lg">🎟️</span>
                                <span className="font-medium text-green-400">Passes from ₹{show.ticket_price}</span>
                            </p>
                            <div className="mt-3 pt-3 border-t border-gray-700/80 flex justify-between text-xs text-gray-400 font-medium">
                                <span>{show.available_seats} Event Passes Left</span>
                            </div>
                        </div>

                        <button
                            className="mt-6 relative z-10 w-full bg-indigo-600 group-hover:bg-indigo-500 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-md group-active:scale-95"
                        >
                            Select Passes
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ShowsPage;
