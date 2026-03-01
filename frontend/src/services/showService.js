/**
 * showService.js — Functions for show/event API calls.
 */
import api from "./api";

export const getShows = () => api.get("/api/shows/");
export const getShow = (id) => api.get(`/api/shows/${id}`);
export const getShowSeats = (id) => api.get(`/api/shows/${id}/seats`);
export const createShow = (data) => api.post("/api/shows/", data);
