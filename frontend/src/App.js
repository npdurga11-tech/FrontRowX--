/**
 * App.js — Root component with routing setup.
 */
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ShowsPage from "./pages/ShowsPage";
import SeatSelectionPage from "./pages/SeatSelectionPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import AdminDashboard from "./pages/AdminDashboard";

import LandingPage from "./pages/LandingPage";
import AttendeeDetailsPage from "./pages/AttendeeDetailsPage";
import PaymentPage from "./pages/PaymentPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <div className="min-h-screen bg-gray-950">
                    <Navbar />
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/shows" element={<ShowsPage />} />

                        {/* Protected routes — requires login */}
                        <Route
                            path="/shows/:showId/seats"
                            element={
                                <ProtectedRoute>
                                    <SeatSelectionPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/shows/:showId/attendee"
                            element={
                                <ProtectedRoute>
                                    <AttendeeDetailsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/shows/:showId/payment"
                            element={
                                <ProtectedRoute>
                                    <PaymentPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/shows/:showId/booking-confirmation"
                            element={
                                <ProtectedRoute>
                                    <BookingConfirmationPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-bookings"
                            element={
                                <ProtectedRoute>
                                    <MyBookingsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/notifications"
                            element={
                                <ProtectedRoute>
                                    <NotificationsPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </div>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
