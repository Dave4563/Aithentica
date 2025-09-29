import { useState } from "react";
import { register } from "../api/auth"; // your API function
import { Link } from "react-router-dom";
import Particles from "react-tsparticles";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!username || !email || !password || !password2) {
      setErrors({ general: "All fields are required" });
      return;
    }

    if (password !== password2) {
      setErrors({ password2: "Passwords do not match" });
      return;
    }

    try {
      const response = await register({ username, email, password, password2 });
      const data = response.data;
      alert(`Registration successful! Welcome ${data.username}`);
      window.location.href = "/login";
    } catch (err: any) {
    const fieldErrors: { [key: string]: string } = {};

    if (err.response?.data) {
      const backendErrors = err.response.data;

      // Check if backend sent a single "error" string
      if (backendErrors.error) {
        fieldErrors.general = backendErrors.error;
      } else {
        // Map known fields
        for (const key in backendErrors) {
          if (Array.isArray(backendErrors[key])) {
            fieldErrors[key] = backendErrors[key][0];
          } else {
            fieldErrors[key] = String(backendErrors[key]);
          }
        }
      }
    } else {
      fieldErrors.general = "Unknown error occurred";
    }

    setErrors(fieldErrors);
  }

  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white flex flex-col items-center justify-center">
      {/* Background Particles */}
      <Particles
        options={{
          background: { color: { value: "#000000" } },
          fpsLimit: 60,
          particles: {
            number: { value: 80 },
            color: { value: ["#ff00ff", "#00ffff", "#ffffff"] },
            shape: { type: "circle" },
            opacity: { value: 0.6 },
            size: { value: { min: 1, max: 3 } },
            move: { enable: true, speed: 0.7, outModes: "bounce" },
            links: { enable: true, distance: 120, color: "#ff00ff", opacity: 0.2, width: 1 },
          },
        }}
        className="absolute inset-0"
      />

      {/* Register Form */}
      <form
        onSubmit={handleRegister}
        className="relative z-10 flex flex-col gap-4 bg-gray-900 bg-opacity-50 border border-amber-400 rounded-2xl p-10 shadow-xl w-80 md:w-96"
      >
        <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orane-400 via-pink-400 to-amber-400 text-center animate-text-glow">
          Register
        </h2>

        {errors.general && <p className="text-red-500 font-bold text-center">{errors.general}</p>}

        <input
          type="text"
          placeholder="Username"
          className="border border-gray-600 bg-transparent p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 transition"
          onChange={(e) => setUsername(e.target.value)}
        />
        {errors.username && <p className="text-red-500">{errors.username}</p>}

        <input
          type="email"
          placeholder="Email"
          className="border border-gray-600 bg-transparent p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 transition"
          onChange={(e) => setEmail(e.target.value)}
        />
        {errors.email && <p className="text-red-500">{errors.email}</p>}

        <input
          type="password"
          placeholder="Password"
          className="border border-gray-600 bg-transparent p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 transition"
          onChange={(e) => setPassword(e.target.value)}
        />
        {errors.password && <p className="text-red-500">{errors.password}</p>}

        <input
          type="password"
          placeholder="Confirm Password"
          className="border border-gray-600 bg-transparent p-3 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400 transition"
          onChange={(e) => setPassword2(e.target.value)}
        />
        {errors.password2 && <p className="text-red-500">{errors.password2}</p>}

        <button
          type="submit"
          className="bg-amber-400 text-black font-bold p-3 rounded-lg hover:bg-amber-500 hover:scale-105 transition transform"
        >
          Register
        </button>

        <p className="text-gray-400 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-amber-400 hover:underline">
            Login
          </Link>
        </p>
      </form>

      {/* Neon Text Glow Animation */}
      <style>
        {`
          @keyframes text-glow {
            0%, 50% { text-shadow: 0 0 5px #fff, 0 0 10px #ff0, 0 0 20px #ff0}
            50% { text-shadow: 0 0 10px #fff, 0 0 20px #ff0, 0 0 30px #ff0 }
          }
          .animate-text-glow {
            animation: text-glow 2s infinite alternate;
          }
        `}
      </style>
    </div>
  );
}
