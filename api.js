import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  timeout: 120000,
});

// Normalise every error into a readable Error message
api.interceptors.response.use(
  (res) => res,
  (err) => {
    let message = "Something went wrong. Please try again.";
    if (err.code === "ERR_NETWORK" || !err.response) {
      message = "Cannot reach the server. Is the backend running on port 8000?";
    } else {
      const detail = err.response.data?.detail;
      if (typeof detail === "string") message = detail;
      else if (Array.isArray(detail) && detail[0]?.msg) message = detail[0].msg;
    }
    return Promise.reject(new Error(message));
  }
);

export const sendChat = (message, sessionId) =>
  api.post("/chat", { message, session_id: sessionId }).then((r) => r.data);

export const clearChatSession = (sessionId) =>
  api.delete(`/chat/${sessionId}`).then((r) => r.data);

export const searchMedicines = (query, top_k = 6) =>
  api.post("/search", { query, top_k }).then((r) => r.data);

export const checkStock = (query) => api.post("/stock", { query }).then((r) => r.data);
export const getAlternative = (query) => api.post("/alternative", { query }).then((r) => r.data);
export const getDosage = (query) => api.post("/dosage", { query }).then((r) => r.data);
export const askFaq = (question) => api.post("/faq", { question }).then((r) => r.data);
export const getHealth = () => api.get("/health").then((r) => r.data);
export const reloadData = () => api.post("/reload-data").then((r) => r.data);

export default api;