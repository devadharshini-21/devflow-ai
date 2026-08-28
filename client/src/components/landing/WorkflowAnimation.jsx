import { BrainCircuit, Users, Sparkles, Code2, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function WorkflowAnimation() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Sparkles size={15} />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-slate-800">AI Project Audit</p>
          <p className="text-[10px] text-slate-400">Deep static code analysis</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-50 text-cyan-600">
          <Users size={15} />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-slate-800">Role Workspaces</p>
          <p className="text-[10px] text-slate-400">Managers &amp; Developers</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
          <BrainCircuit size={15} />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-slate-800">Actionable Remediations</p>
          <p className="text-[10px] text-slate-400">Line-by-line AI fixes</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
          <ShieldCheck size={15} />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-slate-800">Quality Scoring</p>
          <p className="text-[10px] text-slate-400">Automated health gauge</p>
        </div>
      </div>
    </div>
  );
}