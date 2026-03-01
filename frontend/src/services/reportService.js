/**
 * reportService.js — Admin reporting API calls.
 */
import api from "./api";

export const getTotalBookings = () => api.get("/api/reports/total-bookings");
export const getShowSummary = () => api.get("/api/reports/show-summary");
export const getTotalRevenue = () => api.get("/api/reports/total-revenue");
export const getUserBookingHistory = (userId) => api.get(`/api/reports/user/${userId}`);
