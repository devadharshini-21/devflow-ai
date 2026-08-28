import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  CheckSquare,
  Users,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Loader2,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Plus,
  AlertTriangle,
  AlertCircle,
  FileCode,
  Clock,
  Filter,
  BarChart3,
  Calendar,
  Activity,
} from "lucide-react";
import api from "../../services/api";
import { getTimeGreeting } from "../../utils/greeting";

export default function ManagerDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const firstName = user.name ? user.name.split(" ")[0] : "Manager";

  // Data states
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [projectInsights, setProjectInsights] = useState({});
  const [selectedProjectFilter, setSelectedProjectFilter] = useState("ALL");

  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        setLoading(true);
        const [projRes, teamRes, tasksRes, codeRes] = await Promise.allSettled([
          api.get("/projects"),
          api.get("/users/team"),
          api.get("/tasks/all"),
          api.get("/code/all"),
        ]);

        const projectList = projRes.status === "fulfilled" ? projRes.value.data.projects || [] : [];
        const teamList = teamRes.status === "fulfilled" ? teamRes.value.data.users || [] : [];
        const taskList = tasksRes.status === "fulfilled" ? tasksRes.value.data.tasks || [] : [];
        const codeList = codeRes.status === "fulfilled" ? codeRes.value.data.submissions || [] : [];

        setProjects(projectList);
        setTeam(teamList);
        setTasks(taskList);
        setSubmissions(codeList);

        // Fetch insights for first project if available
        if (projectList.length > 0) {
          try {
            const insRes = await api.get(`/code/project/${projectList[0]._id}/ai-insights`);
            if (insRes.data.analysis) {
              setProjectInsights({ [projectList[0]._id]: insRes.data.analysis });
            }
          } catch (e) {
            // optional insight fetch
          }
        }
      } catch (err) {
        console.error("Manager dashboard data error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchManagerData();
  }, []);

  // Filtered views
  const filteredTasks = tasks.filter((t) => {
    if (selectedProjectFilter === "ALL") return true;
    return t.project?._id === selectedProjectFilter || t.project === selectedProjectFilter;
  });

  const filteredSubmissions = submissions.filter((s) => {
    if (selectedProjectFilter === "ALL") return true;
    return s.project?._id === selectedProjectFilter || s.project === selectedProjectFilter;
  });

  // KPI Calculations
  const activeProjectsCount = projects.length;
  const teamCount = team.length;
  const pendingTasksCount = filteredTasks.filter((t) => t.status !== "Completed").length;
  const completedTasksCount = filteredTasks.filter((t) => t.status === "Completed").length;
  const submissionsCount = filteredSubmissions.length;

  // AI Quality Calculations
  const scoredSubmissions = filteredSubmissions.filter((s) => typeof s.qualityScore === "number");
  const avgQualityScore =
    scoredSubmissions.length > 0
      ? Math.round(
          scoredSubmissions.reduce((acc, curr) => acc + curr.qualityScore, 0) /
            scoredSubmissions.length
        )
      : 82;

  const totalCriticalIssues = filteredSubmissions.reduce(
    (acc, s) => acc + (s.errors?.length || 0),
    0
  );

  const readyCount = scoredSubmissions.filter((s) => s.qualityScore >= 80).length;
  const attentionCount = scoredSubmissions.filter((s) => s.qualityScore < 80).length;

  // Helper for score badges
  const getScoreBadge = (score) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 60) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-rose-50 text-rose-700 border-rose-200";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 page-enter">
      {/* =================================================
          TOP HEADER
      ================================================= */}
      <header className="border-b border-slate-200/80 bg-white px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                Project Control Center
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
              {getTimeGreeting()}, {firstName} 👋
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage your projects, team progress, and code quality from one workspace.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Project Filter */}
            {projects.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                <Filter size={13} className="text-slate-400" />
                <select
                  value={selectedProjectFilter}
                  onChange={(e) => setSelectedProjectFilter(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="ALL">All Projects ({projects.length})</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Link
              to="/dashboard/project-manager/projects"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 hover:-translate-y-0.5"
            >
              <Plus size={14} />
              <span>New Project</span>
            </Link>
          </div>
        </div>
      </header>

      {/* =================================================
          MAIN DASHBOARD BODY
      ================================================= */}
      <main className="px-8 py-8 max-w-7xl mx-auto space-y-8">
        {/* =================================================
            1. SUMMARY KPI CARDS (4 CARDS)
        ================================================= */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/dashboard/project-manager/projects"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Active Projects</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FolderKanban size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {loading ? "..." : activeProjectsCount}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Currently managed workspaces</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
              <span>View Projects</span>
              <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            to="/dashboard/project-manager/team"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Engineering Team</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Users size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {loading ? "..." : teamCount}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Developers, UI/UX &amp; QA</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-violet-600">
              <span>View Team</span>
              <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            to="/dashboard/project-manager/tasks"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Pending Tasks</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <CheckSquare size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {loading ? "..." : pendingTasksCount}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{completedTasksCount} tasks completed</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-600">
              <span>View Backlog</span>
              <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
            </div>
          </Link>

          <Link
            to="/dashboard/project-manager/ai-code"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Code Submissions</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Sparkles size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {loading ? "..." : submissionsCount}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Avg Score: {avgQualityScore}/100</p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-600">
              <span>Run AI Audit</span>
              <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        </section>

        {/* =================================================
            2. PROJECT HEALTH SECTION
        ================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <FolderKanban size={18} className="text-indigo-600" />
                <span>Project Health</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Milestones, task completion rates, and AI quality health per managed project
              </p>
            </div>

            <Link
              to="/dashboard/project-manager/projects"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition flex items-center gap-1"
            >
              <span>Manage Projects</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
              <Loader2 className="animate-spin text-indigo-600 mx-auto" size={24} />
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center space-y-3">
              <FolderKanban size={32} className="mx-auto text-slate-300" />
              <p className="text-xs font-bold text-slate-800">No Projects Created Yet</p>
              <Link
                to="/dashboard/project-manager/projects"
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
              >
                <Plus size={13} />
                <span>Create Your First Project</span>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => {
                const projectTasks = tasks.filter(
                  (t) => t.project?._id === project._id || t.project === project._id
                );
                const pCompleted = projectTasks.filter((t) => t.status === "Completed").length;
                const pProgress =
                  projectTasks.length > 0
                    ? Math.round((pCompleted / projectTasks.length) * 100)
                    : 0;

                const projectSubs = submissions.filter(
                  (s) => s.project?._id === project._id || s.project === project._id
                );
                const pScore =
                  projectSubs.length > 0
                    ? Math.round(
                        projectSubs.reduce((acc, s) => acc + (s.qualityScore || 0), 0) /
                          projectSubs.length
                      )
                    : 75;

                return (
                  <div
                    key={project._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{project.name}</h3>
                        <span className="rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold">
                          {project.status || "Active"}
                        </span>
                      </div>

                      {project.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">
                          {project.description}
                        </p>
                      )}

                      {project.technologyStack?.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {project.technologyStack.map((tech, i) => (
                            <span
                              key={i}
                              className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Progress & AI Quality */}
                    <div className="flex flex-wrap items-center gap-6 shrink-0">
                      {/* Task Progress Bar */}
                      <div className="w-36 space-y-1">
                        <div className="flex justify-between text-[11px] font-bold">
                          <span className="text-slate-500">Tasks</span>
                          <span className="text-slate-900">
                            {pCompleted}/{projectTasks.length} ({pProgress}%)
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                            style={{ width: `${pProgress}%` }}
                          />
                        </div>
                      </div>

                      {/* AI Score */}
                      <div className="text-center space-y-0.5">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          AI Quality
                        </span>
                        <span
                          className={`inline-block rounded-md border px-2 py-0.5 text-xs font-black ${getScoreBadge(
                            pScore
                          )}`}
                        >
                          {pScore}/100
                        </span>
                      </div>

                      {/* Action */}
                      <Link
                        to={`/dashboard/project-manager/projects`}
                        className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                      >
                        View Project
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =================================================
            3. TWO-COLUMN SECTION: TEAM PERFORMANCE & AI QUALITY TRENDS
        ================================================= */}
        <section className="grid gap-6 lg:grid-cols-12">
          {/* Left: Team Performance (7 cols) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users size={16} className="text-indigo-600" />
                  <span>Team Performance</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Real-time sprint progress and code quality per developer
                </p>
              </div>

              <Link
                to="/dashboard/project-manager/team"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition"
              >
                View All Team
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="animate-spin text-indigo-600 mx-auto" size={20} />
              </div>
            ) : team.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No team members found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {team.map((member) => {
                  const memberTasks = tasks.filter(
                    (t) => t.assignedTo?._id === member._id || t.assignedTo === member._id
                  );
                  const memberCompleted = memberTasks.filter((t) => t.status === "Completed").length;

                  const memberSubs = submissions.filter(
                    (s) => s.developer?._id === member._id || s.developer === member._id
                  );
                  const memberScore =
                    memberSubs.length > 0
                      ? Math.round(
                          memberSubs.reduce((acc, s) => acc + (s.qualityScore || 0), 0) /
                            memberSubs.length
                        )
                      : null;

                  return (
                    <div
                      key={member._id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-extrabold text-indigo-700 text-xs">
                          {(member.name || "U")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">{member.name}</p>
                          <p className="text-[10px] text-slate-400 font-medium truncate">{member.role}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-medium">Tasks</span>
                          <span className="font-bold text-slate-800">
                            {memberCompleted}/{memberTasks.length} Done
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-medium">AI Quality</span>
                          <span
                            className={`inline-block rounded px-1.5 py-0.2 text-[10px] font-black ${
                              memberScore ? getScoreBadge(memberScore) : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {memberScore ? `${memberScore}%` : "Pending"}
                          </span>
                        </div>

                        <Link
                          to="/dashboard/project-manager/tasks"
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          Assign
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right: AI Quality Trends (5 cols) */}
          <div className="rounded-2xl border border-indigo-200 bg-white p-6 shadow-sm space-y-4 lg:col-span-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-1.5 text-indigo-600">
                  <Sparkles size={16} />
                  <h3 className="text-sm font-bold text-slate-900">AI Quality Trends</h3>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Automated codebase health and security telemetry
                </p>
              </div>

              <Link
                to="/dashboard/project-manager/ai-code"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition"
              >
                Run Audit
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Avg Quality Score</span>
                <p className={`text-2xl font-black ${avgQualityScore >= 80 ? "text-emerald-600" : "text-amber-600"}`}>
                  {avgQualityScore}%
                </p>
                <p className="text-[10px] text-slate-500">Across {submissionsCount} modules</p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Critical Issues</span>
                <p className={`text-2xl font-black ${totalCriticalIssues > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                  {totalCriticalIssues}
                </p>
                <p className="text-[10px] text-slate-500">Requires remediation</p>
              </div>
            </div>

            {/* Quality Distribution Bar */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-600">Quality Breakdown</span>
                <span className="text-indigo-600">{readyCount} Production Ready</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{
                    width: `${submissionsCount > 0 ? (readyCount / submissionsCount) * 100 : 70}%`,
                  }}
                  title="Production Ready"
                />
                <div
                  className="bg-rose-400 h-full"
                  style={{
                    width: `${submissionsCount > 0 ? (attentionCount / submissionsCount) * 100 : 30}%`,
                  }}
                  title="Needs Attention"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  &gt;= 80% (Ready)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  &lt; 80% (Needs Refactoring)
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/dashboard/project-manager/ai-code"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition shadow-2xs"
              >
                <Sparkles size={14} />
                <span>Open AI Intelligence Hub</span>
              </Link>
            </div>
          </div>
        </section>

        {/* =================================================
            4. RECENT ACTIVITY & QUICK ACTIONS
        ================================================= */}
        <section className="grid gap-6 lg:grid-cols-12">
          {/* Left: Recent Activity Feed (7 cols) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 lg:col-span-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Activity size={16} className="text-indigo-600" />
                <span>Recent Activity</span>
              </h3>
              <span className="text-[11px] text-slate-400">Live project feed</span>
            </div>

            <div className="space-y-3">
              {submissions.slice(0, 4).map((sub, idx) => (
                <div
                  key={sub._id || idx}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 font-bold text-[11px] mt-0.5">
                    <FileCode size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-800 font-bold">
                      {sub.developer?.name || "Developer"} submitted{" "}
                      <span className="font-mono text-indigo-700">{sub.fileName}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Project: {sub.project?.name || "Project"} &bull; Score:{" "}
                      <strong className="text-slate-700">{sub.qualityScore ?? "--"}/100</strong>
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(sub.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}

              {submissions.length === 0 && (
                <p className="text-xs text-slate-400 py-4 text-center">No recent activity found.</p>
              )}
            </div>
          </div>

          {/* Right: Quick Actions (5 cols) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 lg:col-span-5">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Quick Actions
            </h3>

            <div className="space-y-2">
              <Link
                to="/dashboard/project-manager/projects"
                className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-bold text-slate-800 hover:border-indigo-200 hover:bg-indigo-50/30 transition"
              >
                <div className="flex items-center gap-2.5">
                  <FolderKanban size={15} className="text-indigo-600" />
                  <span>Create / Configure Project</span>
                </div>
                <ArrowRight size={13} className="text-slate-400 group-hover:text-indigo-600 transition" />
              </Link>

              <Link
                to="/dashboard/project-manager/tasks"
                className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-bold text-slate-800 hover:border-indigo-200 hover:bg-indigo-50/30 transition"
              >
                <div className="flex items-center gap-2.5">
                  <CheckSquare size={15} className="text-cyan-600" />
                  <span>Assign Sprint Tasks</span>
                </div>
                <ArrowRight size={13} className="text-slate-400 group-hover:text-cyan-600 transition" />
              </Link>

              <Link
                to="/dashboard/project-manager/ai-code"
                className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-bold text-slate-800 hover:border-indigo-200 hover:bg-indigo-50/30 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Sparkles size={15} className="text-violet-600" />
                  <span>Run Overall AI Project Audit</span>
                </div>
                <ArrowRight size={13} className="text-slate-400 group-hover:text-violet-600 transition" />
              </Link>

              <Link
                to="/dashboard/project-manager/chat"
                className="group flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs font-bold text-slate-800 hover:border-indigo-200 hover:bg-indigo-50/30 transition"
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare size={15} className="text-emerald-600" />
                  <span>Open Group Chat Channel</span>
                </div>
                <ArrowRight size={13} className="text-slate-400 group-hover:text-emerald-600 transition" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}