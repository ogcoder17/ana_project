import { api } from "./api";

export const aiService = {
  recommend: async (payload) => {
    return api.post("/ai/recommend", payload);
  },

  analyticsSummary: async () => {
    return api.get("/analytics/summary");
  },
};