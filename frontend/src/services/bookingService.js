/**
 * bookingService.js — Functions for booking API calls.
 */
import api from "./api";

export const lockSeat = (data) => api.post("/api/bookings/lock", data);
export const confirmBooking = (data) => api.post("/api/bookings/", data);
export const getMyBookings = () => api.get("/api/bookings/my");
export const cancelBooking = (id) => api.delete(`/api/bookings/${id}`);
