import { Link } from "react-router-dom";
import Particles from "react-tsparticles";

export default function Home() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white flex flex-col items-center justify-center">
      {/* Background Particles */}
      <Particles
        options={{
          background: { color: { value: "#000000" } },
          fpsLimit: 60,
          particles: {
            number: { value: 100 },
            color: { value: ["#00ffff", "#f7601fff", "#ffffff"] },
            shape: { type: "circle" },
            opacity: { value: 0.7 },
            size: { value: { min: 1, max: 4 } },
            move: { enable: true, speed: 0.8, direction: "none", outModes: "bounce" },
            links: { enable: true, distance: 140, color: "#00ffff", opacity: 0.3, width: 1 },
          },
        }}
        className="absolute inset-0"
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">
        <h1 className="text6xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-indigo-400 to-cyan-400 animate-text-glow mb-6">
          Welcome to Aithentica 🚀
        </h1>

        {/* App Description */}
        <p className="text-lg md:text-xl mb-6 text-gray-300">
          Experience the next generation of AI interaction. Our app combines advanced language models, 
          intelligent chat systems, and cutting-edge vision AI to assist, create, and inspire.
        </p>
        <p className="text-md md:text-lg mb-12 text-gray-400">
          Login or register to start your journey into a world where AI transforms your ideas into reality, 
          whether it’s chatting, generating images, or tracking your AI explorations.
        </p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-6">
          <Link
            to="/login"
            className="px-8 py-4 border-2 border-cyan-400 text-cyan-400 font-bold rounded-lg hover:bg-cyan-400 hover:text-black transition transform hover:scale-110"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-4 border-2 border-amber-400 text-amber-400 font-bold rounded-lg hover:bg-amber-400 hover:text-black transition transform hover:scale-110"
          >
            Register
          </Link>
        </div>
      </div>

      {/* Neon Text Glow Animation */}
      <style>
        {`
          @keyframes text-glow {
            0%, 50% { text-shadow: 0 0 4px #fddadaff, 0 0 8px #0ff, 0 0 12px #0ff, 0 0 20px #0ff; }
            50% { text-shadow: 0 0 4px #fbd3d3ff, 0 0 8px #0ff, 0 0 12px #0ff, 0 0 20px #0ff; }
          }
          .animate-text-glow {
            animation: text-glow 2s infinite alternate;
          }
        `}
      </style>
    </div>
  );
}
