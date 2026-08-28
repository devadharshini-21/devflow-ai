import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2, Code2, Users, Bot } from "lucide-react";
import WorkflowAnimation from "./WorkflowAnimation";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 bg-[#F8FAFC]">
      {/* Subtle Background Glows */}
      <div className="pointer-events-none absolute left-1/2 -top-24 h-96 w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-cyan-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 text-center space-y-8">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-white px-4 py-1.5 shadow-xs">
          <Sparkles size={14} className="text-indigo-600" />
          <span className="text-xs font-semibold text-indigo-700">
            Autonomous AI Code Reviews &amp; Collaboration
          </span>
        </div>

        {/* Heading */}
        <h1 className="mx-auto max-w-4xl text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
          Build Better Software,{" "}
          <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 bg-clip-text text-transparent">
            Together with AI.
          </span>
        </h1>

        {/* Description */}
        <p className="mx-auto max-w-2xl text-base sm:text-lg leading-relaxed text-slate-600">
          Plan, build, review and deliver software in one intelligent workspace. Empower your team with automated code health audits, line-by-line remediations, and real-time collaboration.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            to="/register"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
          >
            <span>Get Started for Free</span>
            <ArrowRight size={15} />
          </Link>

          <Link
            to="/login"
            className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900"
          >
            Sign In to Workspace
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="pt-6">
          <WorkflowAnimation />
        </div>

        {/* Interactive App Preview Mockup */}
        <div className="mx-auto max-w-5xl pt-10">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/50">
            {/* Window bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 px-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400/80" />
                <span className="h-3 w-3 rounded-full bg-amber-400/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                <span className="ml-2 text-xs font-mono text-slate-400">devflow-ai.app/dashboard</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI Engine Online</span>
              </div>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="grid gap-4 sm:grid-cols-3 p-4 text-left">
              {/* Card 1 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                    Project Health
                  </span>
                  <span className="rounded-md bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 text-[10px]">
                    85 / 100
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-900">E-Commerce Platform</p>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                </div>
                <p className="text-[11px] text-slate-500">5 submissions reviewed &bull; 0 blockers</p>
              </div>

              {/* Card 2 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-violet-600">
                    AI Code Review
                  </span>
                  <Bot size={14} className="text-violet-600" />
                </div>
                <p className="text-sm font-bold text-slate-900">ProductList.jsx : Line 60</p>
                <p className="text-xs text-slate-600 line-clamp-2">
                  Missing AbortController in useEffect. Fix: add signal to fetch.
                </p>
                <span className="inline-block text-[10px] font-semibold text-emerald-600">
                  &bull; 1-click suggested fix available
                </span>
              </div>

              {/* Card 3 */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600">
                    Team Collaboration
                  </span>
                  <Users size={14} className="text-cyan-600" />
                </div>
                <p className="text-sm font-bold text-slate-900">Active Engineering Team</p>
                <p className="text-xs text-slate-600">
                  Frontend, Backend, UI/UX, QA synchronized via role dashboards.
                </p>
                <span className="inline-block text-[10px] font-semibold text-indigo-600">
                  &bull; Real-time Group Chat &amp; Tasks
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}