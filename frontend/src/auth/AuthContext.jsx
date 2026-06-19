import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    const token = localStorage.getItem("ana_token");

    if (!token) {
      setBooting(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");
      setUser(res.user);
    } catch (e) {
      localStorage.removeItem("ana_token");
      localStorage.removeItem("ana_user");
      setUser(null);
    } finally {
      setBooting(false);
    }
  }

  async function login(payload) {
    const res = await api.post("/auth/login", payload);
    localStorage.setItem("ana_token", res.access_token);
    localStorage.setItem("ana_user", JSON.stringify(res.user));
    setUser(res.user);
    return res;
  }

  async function signup(payload) {
    const res = await api.post("/auth/signup", payload);
    localStorage.setItem("ana_token", res.access_token);
    localStorage.setItem("ana_user", JSON.stringify(res.user));
    setUser(res.user);
    return res;
  }

  function logout() {
    localStorage.removeItem("ana_token");
    localStorage.removeItem("ana_user");
    sessionStorage.removeItem("ana_selected_deal");
    sessionStorage.removeItem("ana_deal_for_negotiation");
    sessionStorage.removeItem("ana_last_result");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthed: !!user,
        booting,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}