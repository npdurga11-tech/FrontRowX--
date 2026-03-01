/**
 * authService.js — Functions for user auth API calls.
 */
import api from "./api";

export const register = (data) => api.post("/api/auth/register", data);
export const login = (data) => api.post("/api/auth/login", data);
