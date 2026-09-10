import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // 'login' | 'register'
  const [rateLimitState, setRateLimitState] = useState(null); // { message, retryAfter }

  // Countdown timer for rate limiting
  useEffect(() => {
    if (!rateLimitState || rateLimitState.retryAfter <= 0) return;

    const interval = setInterval(() => {
      setRateLimitState((prev) => {
        if (!prev || prev.retryAfter <= 1) {
          clearInterval(interval);
          return null;
        }
        return { ...prev, retryAfter: prev.retryAfter - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimitState]);

  // Report rate limit hit to UI
  const triggerRateLimit = useCallback((retryAfter = 60, message = "Rate limit reached. Please slow down.") => {
    setRateLimitState({
      retryAfter: Math.max(1, retryAfter),
      message,
    });
  }, []);

  // Restore session from token
  const verifySession = useCallback(async () => {
    const savedToken = localStorage.getItem("auth_token");
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        triggerRateLimit(data.retryAfter);
      }

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setToken(savedToken);
      } else {
        // Invalid or expired token
        localStorage.removeItem("auth_token");
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.warn("Could not reach auth server on startup:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, [triggerRateLimit]);

  useEffect(() => {
    verifySession();
  }, [verifySession]);

  const openAuthModal = (mode = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({ error: "Failed to parse response" }));

      if (res.status === 429) {
        triggerRateLimit(data.retryAfter, data.error);
        return { success: false, error: data.error || "Rate limit reached. Try again shortly." };
      }

      if (!res.ok) {
        return { success: false, error: data.error || "Login failed" };
      }

      localStorage.setItem("auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      closeAuthModal();
      return { success: true };
    } catch (err) {
      return { success: false, error: "Network error connecting to server" };
    }
  };

  const register = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({ error: "Failed to parse response" }));

      if (res.status === 429) {
        triggerRateLimit(data.retryAfter, data.error);
        return { success: false, error: data.error || "Rate limit reached. Try again shortly." };
      }

      if (!res.ok) {
        return { success: false, error: data.error || "Registration failed" };
      }

      localStorage.setItem("auth_token", data.token);
      setToken(data.token);
      setUser(data.user);
      closeAuthModal();
      return { success: true };
    } catch (err) {
      return { success: false, error: "Network error connecting to server" };
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        rateLimitState,
        triggerRateLimit,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
