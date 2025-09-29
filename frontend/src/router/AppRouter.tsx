import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
// import Vision from "../pages/Vision";
import { useState, useEffect, useCallback } from "react";
import { refreshAccessToken } from "../api/auth";

export default function AppRouter() {
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem("accessToken") // ✅ Load from localStorage
  );
  const [loading, setLoading] = useState(true);

  // Helper: refresh token on demand
  const fetchAccessToken = useCallback(async () => {
    try {
      const { access } = await refreshAccessToken(); // backend reads refresh cookie
      setAccessToken(access);
      localStorage.setItem("accessToken", access); // ✅ Save to localStorage
      return access;
    } catch {
      setAccessToken(null);
      localStorage.removeItem("accessToken"); // ✅ Clear if invalid
      return null;
    }
  }, []);

  // On mount: try to refresh
  useEffect(() => {
    fetchAccessToken().finally(() => setLoading(false));
  }, [fetchAccessToken]);

  if (loading) {
    return (
      <div className="text-white flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const isAuth = !!accessToken;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            isAuth ? (
              <Navigate to="/dashboard" />
            ) : (
              <Login
                onLogin={(token: string) => {
                  setAccessToken(token);
                  localStorage.setItem("accessToken", token); // ✅ Save when logging in
                }}
              />
            )
          }
        />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            isAuth ? (
              <Dashboard
                accessToken={accessToken}
                onRefresh={fetchAccessToken}
                onLogout={() => {
                  setAccessToken(null);
                  localStorage.removeItem("accessToken"); // ✅ Clear on logout
                }}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* <Route
          path="/vision"
          element={
            isAuth ? (
              <Vision accessToken={accessToken} onRefresh={fetchAccessToken} />
            ) : (
              <Navigate to="/login" />
            )
          }
        /> */}
      </Routes>
    </BrowserRouter>
  );
}
