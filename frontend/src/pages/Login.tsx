import { useState } from "react";
import { login } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";
import Particles from "react-tsparticles";

type LoginProps = {
  onLogin?: (accessToken: string) => void; // callback with new access token
};

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Both fields are required");
      return;
    }

    try {
      // backend returns { access, user }, refresh is in HttpOnly cookie
      const { access } = await login({ username, password });

      // Pass access token upward (memory only)
      onLogin?.(access);

      navigate("/dashboard");
    } catch (err: any) {
      if (err.detail) {
        setError(err.detail);
      } else if (err.message === "Network Error") {
        setError("Cannot connect to server. Please try again later.");
      } else {
        setError("Login failed. Please check your credentials.");
      }
    }
  };


  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white flex flex-col items-center justify-center">
      <Particles
        options={{
          background: { color: { value: "#000000" } },
          fpsLimit: 60,
          particles: {
            number: { value: 80 },
            color: { value: ["#00ffff", "#ee2ddbff", "#ffffff"] },
            shape: { type: "circle" },
            opacity: { value: 0.6 },
            size: { value: { min: 1, max: 3 } },
            move: { enable: true, speed: 0.7, outModes: "bounce" },
            links: { enable: true, distance: 120, color: "#0ff", opacity: 0.2, width: 1 },
          },
        }}
        className="absolute inset-0"
      />

      <form
        onSubmit={handleLogin}
        className="relative z-10 flex flex-col gap-6 bg-gray-900 bg-opacity-50 border border-cyan-400 rounded-2xl p-10 shadow-xl w-80 md:w-96"
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-amber-400 to-pink-400 text-center animate-text-glow">
          Login
        </h2>

        {error && <p className="text-red-500 text-center font-semibold">{error}</p>}

        <input
          type="text"
          placeholder="Username"
          value={username}
          className="border border-gray-600 bg-transparent p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 transition"
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          className="border border-gray-600 bg-transparent p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 transition"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="bg-cyan-400 text-black font-bold p-3 rounded-lg hover:bg-amber-500 hover:scale-105 transition transform"
        >
          Login
        </button>

        <p className="text-gray-400 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-amber-400 hover:underline">
            Register
          </Link>
        </p>
      </form>

      <style>
        {`
          @keyframes text-glow {
            0%, 50% { text-shadow: 0 0 5px #fff, 0 0 10px #0ff, 0 0 20px #0ff, 0 0 30px #0ff; }
            50% { text-shadow: 0 0 10px #fff, 0 0 20px #0ff, 0 0 30px #0ff, 0 0 40px #0ff; }
          }
          .animate-text-glow {
            animation: text-glow 2s infinite alternate;
          }
        `}
      </style>
    </div>
  );
}
