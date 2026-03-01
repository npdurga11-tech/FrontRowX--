/**
 * notificationService.js — Functions for notification API calls.
 */
import api from "./api";

export const getNotifications = () => api.get("/api/notifications/");
export const markAsRead = (id) => api.patch(`/api/notifications/${id}/read`);
