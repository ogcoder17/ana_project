import { apiFetch } from "./api";

export const authService = {
  signup: async ({ name, email, password, role }) => {
    return apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  login: async ({ email, password }) => {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  me: async () => {
    return apiFetch("/auth/me", {
      method: "GET",
    });
  },
};