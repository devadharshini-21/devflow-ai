import { Link } from "react-router-dom";
import {
  Sparkles,
  Bot,
  Users,
  CheckSquare,
  ShieldCheck,
  FolderKanban,
  Zap,
  ArrowRight,
  Code2,
  Lock,
  MessageSquare,
} from "lucide-react";
import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      <Navbar />

      <Hero />

      {/* ==========================================
          FEATURES SECTION
      ========================================== */}
      <section id="features" className="py-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Everything Your Engineering Team Needs
            </h2>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600">
              Built from the ground up for agile software teams that want fast feedback cycles and high code quality.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-3 transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md hover:bg-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                <Bot size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Line-by-Line AI Code Audits</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini-powered static code analysis that pinpoints exact line numbers, problematic snippets, root cause explanations, and copyable fixes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-3 transition hover:-translate-y-1 hover:border-violet-300 hover:shadow-md hover:bg-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Users size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Role-Based Workspaces</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tailored dashboards for Project Managers, Frontend Developers, Backend Developers, UI/UX Designers, and QA Testers.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 space-y-3 transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-md hover:bg-white">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
                <CheckSquare size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Agile Task &amp; Project Hub</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Assign tasks with priority levels, track live progress bars, monitor sprint velocity, and collaborate via synchronized team chat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          WORKFLOW SECTION
      ========================================== */}
      <section id="workflow" className="py-20 bg-[#F8FAFC]">
        <div className="mx-auto max-w-6xl px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How DevFlow AI Accelerates Delivery
            </h2>
            <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600">
              A smooth 4-step workflow from task assignment to AI-verified release.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2 shadow-xs">
              <span className="text-2xl font-black text-indigo-600">01</span>
              <h4 className="text-sm font-bold text-slate-900">Create &amp; Assign</h4>
              <p className="text-xs text-slate-500">
                Managers set up projects, assemble engineering teams, and assign tasks with deadlines.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2 shadow-xs">
              <span className="text-2xl font-black text-violet-600">02</span>
              <h4 className="text-sm font-bold text-slate-900">Submit Code</h4>
              <p className="text-xs text-slate-500">
                Developers paste or upload code directly into the Code Studio for instantaneous review.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2 shadow-xs">
              <span className="text-2xl font-black text-cyan-600">03</span>
              <h4 className="text-sm font-bold text-slate-900">Automated Audit</h4>
              <p className="text-xs text-slate-500">
                AI evaluates vulnerabilities, bugs, edge cases, and assigns a calibrated health score.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-2 shadow-xs">
              <span className="text-2xl font-black text-emerald-600">04</span>
              <h4 className="text-sm font-bold text-slate-900">Manager Synthesis</h4>
              <p className="text-xs text-slate-500">
                Managers analyze entire codebases, routing private actionable remediations to each developer.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          CALL TO ACTION BANNER
      ========================================== */}
      <section className="py-20 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl px-6 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ready to Build Better Software with AI?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Join development teams using DevFlow AI to ship cleaner, faster, and more reliable applications.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-indigo-600/25 transition hover:bg-indigo-500 hover:-translate-y-0.5"
            >
              <span>Get Started Now</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================
          FOOTER
      ========================================== */}
      <footer className="border-t border-slate-200 bg-slate-50 py-10 text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-xs font-bold text-white">
              D
            </div>
            <span className="font-bold text-slate-800">DevFlow AI</span>
            <span>&bull; AI-Powered Software Collaboration Platform</span>
          </div>

          <p>&copy; {new Date().getFullYear()} DevFlow AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}