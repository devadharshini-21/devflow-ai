import { Link } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-sm font-bold text-white shadow-sm shadow-indigo-500/20">
            D
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              DevFlow <span className="text-indigo-600">AI</span>
            </h1>
          </div>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-600">
          <a href="#features" className="transition hover:text-indigo-600">
            Features
          </a>
          <a href="#workflow" className="transition hover:text-indigo-600">
            How It Works
          </a>
          <a href="#ai-capabilities" className="transition hover:text-indigo-600">
            AI Capabilities
          </a>
        </nav>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Sign In
          </Link>

          <Link
            to="/register"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Get Started</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </header>
  );
}