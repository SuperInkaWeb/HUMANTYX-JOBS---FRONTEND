import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";
import { AuthCtx } from "./auth-context";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadMe(nextToken = token) {
    if (!nextToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const me = await apiFetch("/auth/me");
      const u = me?.user || null;
      setUser(u);
      return u;
    } catch {
      localStorage.removeItem("token");
      setToken("");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }

  async function refreshMe() {
    setLoading(true);
    return await loadMe();
  }

  useEffect(() => {
    setLoading(true);
    loadMe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function login(email, password) {
    setLoading(true);

    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("token", data.token);
    setToken(data.token);

    const u = await loadMe(data.token);
    return u;
  }

  async function register(email, password) {
    setLoading(true);

    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem("token", data.token);
    setToken(data.token);

    const u = await loadMe(data.token);
    return u;
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshMe }),
    [user, token, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}