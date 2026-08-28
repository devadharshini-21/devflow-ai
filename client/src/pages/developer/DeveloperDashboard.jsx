import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckSquare,
  FolderKanban,
  MessageSquare,
  Bot,
  Users,
  ArrowRight,
  Settings,
  Sparkles,
  Loader2,
  Clock,
  CheckCircle2,
  FileCode,
  AlertTriangle,
  AlertCircle,
  Wrench,
  TrendingUp,
  ShieldCheck,
  Code2,
} from "lucide-react";
import api from "../../services/api";
import { getTimeGreeting } from "../../utils/greeting";

export default function DeveloperDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || "Frontend Developer";

  let basePath = "/dashboard/developer";
  if (window.location.pathname.startsWith("/dashboard/frontend")) basePath = "/dashboard/frontend";
  else if (window.location.pathname.startsWith("/dashboard/backend")) basePath = "/dashboard/backend";
  else if (window.location.pathname.startsWith("/dashboard/uiux")) basePath = "/dashboard/uiux";
  else if (window.location.pathname.startsWith("/dashboard/qa")) basePath = "/dashboard/qa";

  const firstName = user.name ? user.name.split(" ")[0] : "Developer";

  // Dashboard States
  const [tasks, setTasks] = useState([]);
  const [projectsCount, setProjectsCount] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [managerReviews, setManagerReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [tasksRes, projsRes, subsRes, mgrReviewsRes] = await Promise.allSettled([
          api.get("/tasks/my"),
          api.get("/projects"),
          api.get("/code/my"),
          api.get("/code/my-manager-reviews"),
        ]);

        if (tasksRes.status === "fulfilled") {
          setTasks(tasksRes.value.data.tasks || []);
        }
        if (projsRes.status === "fulfilled") {
          setProjectsCount((projsRes.value.data.projects || []).length);
        }
        if (subsRes.status === "fulfilled") {
          setSubmissions(subsRes.value.data.submissions || []);
        }
        if (mgrReviewsRes.status === "fulfilled") {
          setManagerReviews(mgrReviewsRes.value.data.reviews || []);
        }
      } catch (err) {
        console.error("Developer dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Stats Calculations
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const pendingTasks = tasks.filter((t) => t.status !== "Completed").length;
  const submissionsCount = submissions.length;

  // Personal Code Quality
  const scoredSubs = submissions.filter((s) => typeof s.qualityScore === "number");
  const myAvgScore =
    scoredSubs.length > 0
      ? Math.round(
          scoredSubs.reduce((acc, curr) => acc + curr.qualityScore, 0) / scoredSubs.length
        )
      : 80;

  const totalManagerIssuesCount = managerReviews.reduce(
    (acc, r) => acc + (r.developerIssuesCount || 0),
    0
  );
  const latestManagerReview = managerReviews.length > 0 ? managerReviews[0] : null;

  // Extract latest actionable findings across developer submissions
  const recentFindings = [];
  submissions.forEach((sub) => {
    if (sub.errors?.length > 0) {
      sub.errors.slice(0, 2).forEach((err) => {
        recentFindings.push({
          severity: "CRITICAL",
          fileName: sub.fileName,
          problem: err,
          project: sub.project?.name || "Project",
        });
      });
    }
    if (sub.warnings?.length > 0) {
      sub.warnings.slice(0, 1).forEach((warn) => {
        recentFindings.push({
          severity: "MEDIUM",
          fileName: sub.fileName,
          problem: warn,
          project: sub.project?.name || "Project",
        });
      });
    }
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "Critical":
        return "text-rose-700 bg-rose-50 border-rose-200";
      case "High":
        return "text-orange-700 bg-orange-50 border-orange-200";
      case "Medium":
        return "text-amber-700 bg-amber-50 border-amber-200";
      default:
        return "text-slate-600 bg-slate-100 border-slate-200";
    }
  };

  const getScoreBadge = (score) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 page-enter">
      {/* =================================================
          WELCOME HEADER
      ================================================= */}
      <header className="border-b border-slate-200/80 bg-white px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-cyan-700 bg-cyan-50 border border-cyan-200 px-2 py-0.5 rounded-md">
                {role} Workspace
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              {getTimeGreeting()}, {firstName} 👋
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Here&apos;s what you need to focus on today. Track your sprint tasks and code quality.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to={`${basePath}/ai-code`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 hover:-translate-y-0.5"
            >
              <Bot size={14} />
              <span>Submit Code</span>
            </Link>

            <Link
              to={`${basePath}/settings`}
              className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
            >
              <Settings size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN CONTENT
      ================================================= */}
      <main className="px-8 py-8 max-w-7xl mx-auto space-y-8">
        {/* =================================================
            1. DEVELOPER KPI SUMMARY CARDS (4 CARDS)
        ================================================= */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to={`${basePath}/tasks`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Assigned Tasks</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <CheckSquare size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {loading ? "..." : pendingTasks}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Pending sprint assignments</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>View Backlog</span>
              <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            to={`${basePath}/tasks`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Completed Tasks</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {loading ? "..." : completedTasks}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Successfully delivered</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Sprint Progress</span>
              <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            to={`${basePath}/ai-code`}
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Code Submissions</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <FileCode size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {loading ? "..." : submissionsCount}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Files analyzed with AI</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-cyan-600">
              <span>Code Studio</span>
              <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
            </div>
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">My AI Quality Score</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Sparkles size={18} />
              </div>
            </div>
            <div>
              <h3 className={`text-2xl font-extrabold tracking-tight ${myAvgScore >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
                {loading ? "..." : `${myAvgScore}%`}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {myAvgScore >= 80 ? "Production Ready" : "Needs Refactoring"}
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-violet-600">
              <Link to={`${basePath}/ai-code`} className="flex items-center justify-between w-full">
                <span>View Quality History</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </section>

        {/* =================================================
            2. TWO COLUMN: MY ASSIGNED TASKS & MY CODE QUALITY
        ================================================= */}
        <section className="grid gap-6 lg:grid-cols-12">
          {/* Left: My Tasks (7 cols) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CheckSquare size={16} className="text-indigo-600" />
                  <span>My Assigned Tasks</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Tasks assigned specifically to you by your project manager
                </p>
              </div>

              <Link
                to={`${basePath}/tasks`}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition flex items-center gap-1"
              >
                <span>View All Tasks</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="animate-spin text-indigo-600 mx-auto" size={20} />
              </div>
            ) : tasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center space-y-2">
                <CheckSquare size={28} className="mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-800">No active tasks assigned yet</p>
                <p className="text-[11px] text-slate-500">New sprint tasks will appear here automatically.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {tasks.slice(0, 4).map((task) => (
                  <div
                    key={task._id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{task.title}</h4>
                        <span
                          className={`rounded border px-1.5 py-0.2 text-[9px] font-bold ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority || "Medium"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Project: <strong className="text-indigo-600">{task.project?.name || "Project"}</strong>
                        {task.dueDate && ` &bull; Due: ${new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
                          task.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : task.status === "In Progress"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: My Code Quality (5 cols) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 lg:col-span-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-violet-600">
                  <Sparkles size={16} />
                  <h3 className="text-sm font-bold text-slate-900">My Code Quality</h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Personal quality score and review benchmark
                </p>
              </div>

              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getScoreBadge(
                  myAvgScore
                )}`}
              >
                {myAvgScore >= 80 ? "Production Grade" : "Needs Review"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Current AI Score</span>
                <p className={`text-2xl font-black ${myAvgScore >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
                  {myAvgScore}%
                </p>
                <p className="text-[10px] text-slate-500">Across {submissionsCount} submissions</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Issues in Your Code</span>
                <p className={`text-2xl font-black ${totalManagerIssuesCount > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {totalManagerIssuesCount}
                </p>
                <p className="text-[10px] text-slate-500">Flagged by Manager AI</p>
              </div>
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-indigo-950">Manager AI Reviews</span>
                <span className="text-indigo-600">{managerReviews.length} Available</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Project manager audits generate line-by-line remediations specific to your code.
              </p>
              <div className="pt-1">
                <Link
                  to={`${basePath}/manager-reviews`}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-500"
                >
                  <span>View Manager AI Reviews</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            3. LATEST AI FINDINGS & RECENT SUBMISSIONS
        ================================================= */}
        <section className="grid gap-6 lg:grid-cols-12">
          {/* Left: Latest AI Findings (7 cols) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <AlertCircle size={16} className="text-rose-600" />
                  <span>Latest Actionable AI Findings</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Recent warnings and suggestions from your code reviews
                </p>
              </div>

              <Link
                to={`${basePath}/manager-reviews`}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition"
              >
                Inspect All
              </Link>
            </div>

            {recentFindings.length === 0 ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-6 text-center space-y-1">
                <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-1" />
                <p className="text-xs font-bold text-emerald-900">No Critical Issues in Recent Code</p>
                <p className="text-[11px] text-emerald-700">Your latest submitted modules passed AI evaluation cleanly.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentFindings.slice(0, 3).map((finding, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.2 rounded">
                        {finding.fileName}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                          finding.severity === "CRITICAL"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {finding.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-800 font-semibold leading-relaxed">
                      {finding.problem}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Recent Code Submissions (5 cols) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 lg:col-span-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileCode size={16} className="text-indigo-600" />
                <span>Recent Submissions</span>
              </h3>

              <Link
                to={`${basePath}/ai-code`}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition"
              >
                Code Studio
              </Link>
            </div>

            <div className="space-y-2.5">
              {submissions.slice(0, 4).map((sub) => (
                <div
                  key={sub._id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 text-xs"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-bold text-slate-900 truncate font-mono text-[11px]">
                      {sub.fileName}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">
                      {sub.project?.name || "Project"} &bull; {new Date(sub.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`rounded-md border px-2 py-0.5 text-[10px] font-black shrink-0 ${getScoreBadge(
                      sub.qualityScore
                    )}`}
                  >
                    {sub.qualityScore ?? "--"}/100
                  </span>
                </div>
              ))}

              {submissions.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No submissions yet.</p>
              )}
            </div>
          </div>
        </section>

        {/* =================================================
            4. QUICK ACTIONS BAR
        ================================================= */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <Code2 size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Developer Quick Actions</p>
                <p className="text-[10px] text-slate-500">Direct shortcuts to frequent development workflows</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to={`${basePath}/ai-code`}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                Submit Code File
              </Link>
              <Link
                to={`${basePath}/tasks`}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                My Sprint Tasks
              </Link>
              <Link
                to={`${basePath}/manager-reviews`}
                className="rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
              >
                Manager AI Reviews
              </Link>
              <Link
                to={`${basePath}/chat`}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
              >
                Group Chat
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}