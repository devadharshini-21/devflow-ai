import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-white/10 bg-[#07111F]/80 backdrop-blur-xl">

      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">

        {/* Logo */}

        <Link
          to="/"
          className="flex items-center gap-3"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-lg font-bold text-white shadow-lg shadow-indigo-500/20">
            D
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              DevFlow <span className="text-indigo-400">AI</span>
            </h1>
          </div>
        </Link>

        {/* Right Buttons */}

        <div className="flex items-center gap-4">

          <Link
            to="/login"
            className="rounded-lg border border-slate-700 px-5 py-2 text-white transition hover:border-indigo-500 hover:bg-slate-800"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="rounded-lg bg-indigo-600 px-5 py-2 text-white transition hover:bg-indigo-500"
          >
            Register
          </Link>

        </div>

      </div>

    </header>
  );
}