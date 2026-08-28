import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Code2,
  FileCode,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Loader2,
  Eye,
  RefreshCw,
  FolderKanban,
  Users,
  Activity,
  X,
  Search,
  Filter,
  ShieldCheck,
  Zap,
  Clock,
  TrendingUp,
  Cpu,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Wrench,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function ManagerAICode() {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Selected project for Overall Analysis
  const [selectedAnalysisProjectId, setSelectedAnalysisProjectId] = useState("");

  // Submissions State
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [submissionsError, setSubmissionsError] = useState(null);

  // Overall Project Analysis State
  const [projectAnalysis, setProjectAnalysis] = useState(null);
  const [projectFindings, setProjectFindings] = useState([]);
  const [expandedDevIndex, setExpandedDevIndex] = useState(null);
  const [loadingOverall, setLoadingOverall] = useState(false);
  const [fetchingCachedAnalysis, setFetchingCachedAnalysis] = useState(false);

  // Filter States for Individual Submissions Table
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("ALL");
  const [selectedDeveloperId, setSelectedDeveloperId] = useState("ALL");
  const [selectedLanguage, setSelectedLanguage] = useState("ALL");
  const [selectedScoreRange, setSelectedScoreRange] = useState("ALL");
  const [sortBy, setSortBy] = useState("newest");

  // Re-analyze loading state for individual submissions
  const [analyzingSubmissionId, setAnalyzingSubmissionId] = useState(null);

  // Modal State for viewing code or single submission report
  const [activeModal, setActiveModal] = useState(null); // 'code' | 'report' | null
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // 1. Fetch Managed Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        const list = res.data.projects || [];
        setProjects(list);
        if (list.length > 0) {
          setSelectedAnalysisProjectId(list[0]._id);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // 2. Fetch All Submissions
  const fetchAllSubmissions = async () => {
    setLoadingSubmissions(true);
    setSubmissionsError(null);
    try {
      const res = await api.get("/code/all");
      setSubmissions(res.data.submissions || []);
    } catch (err) {
      console.error("Failed to fetch developer submissions:", err);
      setSubmissionsError(
        err.response?.data?.message || "Unable to load code submissions."
      );
      toast.error("Unable to load code submissions.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchAllSubmissions();
  }, []);

  // 3. Fetch Cached Latest Project Analysis & Project Findings
  const fetchLatestProjectAnalysis = async (projId) => {
    if (!projId) return;
    setFetchingCachedAnalysis(true);
    try {
      const [analysisRes, findingsRes] = await Promise.allSettled([
        api.get(`/code/project/${projId}/ai-insights`),
        api.get(`/code/project/${projId}/findings`),
      ]);

      if (analysisRes.status === "fulfilled") {
        setProjectAnalysis(analysisRes.value.data.analysis || null);
      } else {
        setProjectAnalysis(null);
      }

      if (findingsRes.status === "fulfilled") {
        setProjectFindings(findingsRes.value.data.findings || []);
      } else {
        setProjectFindings([]);
      }
    } catch (err) {
      console.error("Failed to fetch cached project analysis:", err);
      setProjectAnalysis(null);
      setProjectFindings([]);
    } finally {
      setFetchingCachedAnalysis(false);
    }
  };

  useEffect(() => {
    if (selectedAnalysisProjectId) {
      fetchLatestProjectAnalysis(selectedAnalysisProjectId);
    }
  }, [selectedAnalysisProjectId]);

  // 4. Trigger Overall Project AI Analysis
  const handleOverallAnalysis = async () => {
    if (!selectedAnalysisProjectId) {
      toast.error("Please select a project to analyze");
      return;
    }

    const projectSubmissions = submissions.filter((s) => {
      const pId = s.project?._id || s.project;
      return pId === selectedAnalysisProjectId;
    });

    if (projectSubmissions.length === 0) {
      toast.error("No code submissions are available for this project yet.");
      return;
    }

    setLoadingOverall(true);
    try {
      const res = await api.post(
        `/code/project/${selectedAnalysisProjectId}/ai-insights`
      );
      setProjectAnalysis(res.data.analysis || res.data.insights);

      try {
        const fRes = await api.get(
          `/code/project/${selectedAnalysisProjectId}/findings`
        );
        setProjectFindings(fRes.data.findings || []);
      } catch {
        // Safe fallback
      }

      toast.success("Overall Project AI Analysis generated successfully!");
    } catch (err) {
      console.error("Overall project analysis error:", err);
      toast.error(
        err.response?.data?.message ||
          "Unable to generate the project analysis. Please try again."
      );
    } finally {
      setLoadingOverall(false);
    }
  };

  // 5. Re-Analyze Single Submission
  const handleAnalyzeSubmission = async (submissionId) => {
    setAnalyzingSubmissionId(submissionId);
    try {
      const res = await api.post(`/code/${submissionId}/analyze`);
      const updated = res.data.submission;

      setSubmissions((prev) =>
        prev.map((s) => (s._id === submissionId ? updated : s))
      );

      if (selectedSubmission?._id === submissionId) {
        setSelectedSubmission(updated);
      }

      toast.success("AI Analysis updated successfully!");
    } catch (err) {
      console.error("Re-analyze error:", err);
      toast.error(
        err.response?.data?.message || "Failed to analyze code submission"
      );
    } finally {
      setAnalyzingSubmissionId(null);
    }
  };

  const handleCopyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper Score Color
  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  // Helper Severity Badge
  const getSeverityBadge = (severity) => {
    switch (severity?.toLowerCase()) {
      case "critical":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "high":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "medium":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "low":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  // Current analysis project object
  const currentAnalysisProject = projects.find(
    (p) => p._id === selectedAnalysisProjectId
  );

  const selectedProjectSubmissionsCount = submissions.filter((s) => {
    const pId = s.project?._id || s.project;
    return pId === selectedAnalysisProjectId;
  }).length;

  // Filter Dropdown Options
  const uniqueDevelopers = useMemo(() => {
    const map = new Map();
    submissions.forEach((s) => {
      if (s.developer?._id && !map.has(s.developer._id)) {
        map.set(s.developer._id, s.developer);
      }
    });
    return Array.from(map.values());
  }, [submissions]);

  const uniqueLanguages = useMemo(() => {
    const set = new Set();
    submissions.forEach((s) => {
      if (s.language) set.add(s.language);
    });
    return Array.from(set);
  }, [submissions]);

  // Filtered Submissions List
  const filteredSubmissions = useMemo(() => {
    return submissions
      .filter((sub) => {
        if (selectedProjectId !== "ALL") {
          const pId = sub.project?._id || sub.project;
          if (pId !== selectedProjectId) return false;
        }

        if (selectedDeveloperId !== "ALL") {
          const dId = sub.developer?._id || sub.developer;
          if (dId !== selectedDeveloperId) return false;
        }

        if (selectedLanguage !== "ALL" && sub.language !== selectedLanguage) {
          return false;
        }

        if (selectedScoreRange === "high" && (sub.qualityScore ?? 0) < 80) return false;
        if (
          selectedScoreRange === "medium" &&
          ((sub.qualityScore ?? 0) < 60 || (sub.qualityScore ?? 0) >= 80)
        )
          return false;
        if (selectedScoreRange === "low" && (sub.qualityScore ?? 0) >= 60) return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const devName = sub.developer?.name?.toLowerCase() || "";
          const devEmail = sub.developer?.email?.toLowerCase() || "";
          const fName = sub.fileName?.toLowerCase() || "";
          const pName = sub.project?.name?.toLowerCase() || "";
          if (
            !devName.includes(q) &&
            !devEmail.includes(q) &&
            !fName.includes(q) &&
            !pName.includes(q)
          ) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
        if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
        if (sortBy === "score_high") return (b.qualityScore ?? 0) - (a.qualityScore ?? 0);
        if (sortBy === "score_low") return (a.qualityScore ?? 0) - (b.qualityScore ?? 0);
        return 0;
      });
  }, [
    submissions,
    selectedProjectId,
    selectedDeveloperId,
    selectedLanguage,
    selectedScoreRange,
    searchQuery,
    sortBy,
  ]);

  const avgQuality =
    filteredSubmissions.length > 0
      ? Math.round(
          filteredSubmissions.reduce((acc, curr) => acc + (curr.qualityScore || 0), 0) /
            filteredSubmissions.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 page-enter">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white px-8 py-5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600">
              Project Manager
            </p>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              AI Code Intelligence &amp; Quality Audit
            </h1>
          </div>

          <button
            onClick={() => {
              fetchAllSubmissions();
              if (selectedAnalysisProjectId) {
                fetchLatestProjectAnalysis(selectedAnalysisProjectId);
              }
            }}
            disabled={loadingSubmissions}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 shadow-xs"
          >
            <RefreshCw size={14} className={loadingSubmissions ? "animate-spin" : ""} />
            <span>Refresh Audits</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* Top Summary Stats Bar */}
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Managed Projects</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <FolderKanban size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{projects.length}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Active engineering workspaces</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Code Submissions</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Code2 size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{submissions.length}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Reviewed developer modules</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Active Contributors</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <Users size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{uniqueDevelopers.length}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Team members submitting code</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Average Quality Score</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Activity size={18} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {avgQuality > 0 ? `${avgQuality}/100` : "--"}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Automated code health gauge</p>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* OVERALL PROJECT ANALYSIS SECTION */}
        {/* ======================================================== */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          {/* Section Header & Project Selector */}
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Sparkles size={18} />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Overall AI Project Analysis
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-500 max-w-2xl leading-relaxed">
                Consolidated Gemini AI review synthesizing quality, vulnerabilities, bottlenecks, and developer remediations.
              </p>
            </div>

            {/* Project Selector & Analyze Button */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500">Project:</label>
                <select
                  value={selectedAnalysisProjectId}
                  onChange={(e) => setSelectedAnalysisProjectId(e.target.value)}
                  disabled={loadingProjects || loadingOverall}
                  className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition focus:border-indigo-500 cursor-pointer"
                >
                  {projects.length === 0 ? (
                    <option value="">No projects found</option>
                  ) : (
                    projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <button
                onClick={handleOverallAnalysis}
                disabled={
                  loadingOverall ||
                  fetchingCachedAnalysis ||
                  selectedProjectSubmissionsCount === 0 ||
                  !selectedAnalysisProjectId
                }
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loadingOverall ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Analyzing project...</span>
                  </>
                ) : (
                  <>
                    <Cpu size={14} />
                    <span>
                      {projectAnalysis ? "Re-Analyze Project" : "Analyze Project"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Submissions Status indicator */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <FolderKanban size={14} className="text-indigo-600" />
              <span>
                Selected: <strong className="text-slate-900">{currentAnalysisProject?.name || "None"}</strong>
              </span>
              <span>&bull;</span>
              <span>
                Submissions:{" "}
                <strong className={selectedProjectSubmissionsCount > 0 ? "text-emerald-700" : "text-amber-700"}>
                  {selectedProjectSubmissionsCount} file(s)
                </strong>
              </span>
            </div>

            {projectAnalysis?.createdAt && (
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <Clock size={12} className="text-slate-400" />
                <span>
                  Last Run:{" "}
                  <strong className="text-slate-700">
                    {new Date(projectAnalysis.createdAt).toLocaleString()}
                  </strong>
                </span>
              </div>
            )}
          </div>

          {/* Project Health & Detailed Insights Body */}
          {fetchingCachedAnalysis ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="animate-spin text-indigo-600 mb-2" size={24} />
              <p className="text-xs text-slate-500">Loading project insights...</p>
            </div>
          ) : selectedProjectSubmissionsCount === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
              <FolderKanban size={32} className="mb-2 text-slate-400" />
              <p className="text-sm font-bold text-slate-800">
                No code submissions available for this project yet.
              </p>
              <p className="mt-1 max-w-md text-xs text-slate-500">
                When developers assigned to this project submit code, their submissions will appear here for project-wide AI synthesis.
              </p>
            </div>
          ) : !projectAnalysis ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/30 py-12 text-center">
              <Sparkles size={32} className="mb-2 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Project Code Ready for AI Synthesis
              </h3>
              <p className="mt-1 max-w-lg text-xs text-slate-500">
                This project has {selectedProjectSubmissionsCount} submitted code file(s). Click &quot;Analyze Project&quot; to generate the review.
              </p>
              <button
                onClick={handleOverallAnalysis}
                disabled={loadingOverall}
                className="mt-4 flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-500 transition"
              >
                <Cpu size={14} />
                <span>Run Overall Project Analysis</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 1. Score & Summary */}
              <div className="grid gap-5 md:grid-cols-12">
                {/* Score Card */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:col-span-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
                      PROJECT QUALITY SCORE
                    </p>
                    <h3 className="mt-1 text-3xl font-black text-slate-900 tracking-tight">
                      {projectAnalysis.overallQualityScore ?? 0}
                      <span className="text-xs font-semibold text-slate-400"> / 100</span>
                    </h3>
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                      <TrendingUp size={11} />
                      <span>{projectAnalysis.healthStatus || (projectAnalysis.overallQualityScore >= 80 ? "Good Health" : "Needs Attention")}</span>
                    </div>
                  </div>

                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl border text-2xl font-black shadow-xs ${getScoreColor(
                      projectAnalysis.overallQualityScore
                    )}`}
                  >
                    {projectAnalysis.overallQualityScore}
                  </div>
                </div>

                {/* AI Executive Summary */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:col-span-8 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-600">
                    <Zap size={15} />
                    <h4 className="text-xs font-bold uppercase tracking-wider">
                      Executive AI Summary
                    </h4>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700">
                    {projectAnalysis.summary || projectAnalysis.executiveSummary}
                  </p>
                </div>
              </div>

              {/* 2. Common Issues & Security Concerns */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Common Issues */}
                <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 space-y-3">
                  <div className="flex items-center justify-between text-rose-700 border-b border-rose-200/60 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle size={16} />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Common Issues ({projectAnalysis.commonIssues?.length || 0})
                      </h4>
                    </div>
                  </div>

                  {projectAnalysis.commonIssues?.length > 0 ? (
                    <div className="space-y-2">
                      {projectAnalysis.commonIssues.map((issue, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-rose-200 bg-white p-3 space-y-1 shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {idx + 1}. {issue.title || issue}
                            </span>
                            {issue.severity && (
                              <span
                                className={`shrink-0 rounded border px-1.5 py-0.2 text-[9px] font-bold ${getSeverityBadge(
                                  issue.severity
                                )}`}
                              >
                                {issue.severity}
                              </span>
                            )}
                          </div>
                          {issue.description && (
                            <p className="text-[11px] text-slate-600">{issue.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-700">No recurring bugs or logic issues detected.</p>
                  )}
                </div>

                {/* Security Concerns */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 space-y-3">
                  <div className="flex items-center justify-between text-amber-800 border-b border-amber-200/60 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert size={16} />
                      <h4 className="text-xs font-bold uppercase tracking-wider">
                        Security Concerns ({projectAnalysis.securityConcerns?.length || 0})
                      </h4>
                    </div>
                  </div>

                  {projectAnalysis.securityConcerns?.length > 0 ? (
                    <div className="space-y-2">
                      {projectAnalysis.securityConcerns.map((sec, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-amber-200 bg-white p-3 space-y-1 shadow-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {idx + 1}. {sec.title || sec}
                            </span>
                            {sec.severity && (
                              <span
                                className={`shrink-0 rounded border px-1.5 py-0.2 text-[9px] font-bold ${getSeverityBadge(
                                  sec.severity
                                )}`}
                              >
                                {sec.severity}
                              </span>
                            )}
                          </div>
                          {sec.description && (
                            <p className="text-[11px] text-slate-600">{sec.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-700">No security vulnerabilities identified.</p>
                  )}
                </div>
              </div>

              {/* 3. Developer Health & Findings Accordion */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-indigo-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Developer Health &amp; Exact Findings
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Click developer card to view exact remediations
                  </span>
                </div>

                {projectAnalysis.developerInsights?.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {projectAnalysis.developerInsights.map((dev, i) => {
                      const isExpanded = expandedDevIndex === i;
                      return (
                        <div
                          key={i}
                          onClick={() => setExpandedDevIndex(isExpanded ? null : i)}
                          className={`cursor-pointer rounded-xl border p-4 transition-all duration-150 flex flex-col justify-between space-y-3 ${
                            isExpanded
                              ? "border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-sm"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs"
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between">
                              <div>
                                <h5 className="font-bold text-slate-900 text-xs">{dev.developerName}</h5>
                                <p className="text-[10px] text-indigo-600 font-medium">{dev.role}</p>
                              </div>
                              <span
                                className={`rounded-md border px-1.5 py-0.5 text-[11px] font-bold ${getScoreColor(
                                  dev.averageQualityScore
                                )}`}
                              >
                                {dev.averageQualityScore}%
                              </span>
                            </div>

                            <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-2 mt-2">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Submissions:</span>
                                <span className="font-semibold text-slate-800">{dev.filesSubmitted}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Critical Issues:</span>
                                <span
                                  className={`font-semibold ${
                                    dev.criticalIssues > 0 ? "text-rose-600" : "text-emerald-600"
                                  }`}
                                >
                                  {dev.criticalIssues || 0}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-600 border-t border-slate-100 pt-2">
                            <span>{isExpanded ? "Hide Findings" : "View Findings"}</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No developer insights available.</p>
                )}

                {/* Expanded Findings Drawer */}
                {expandedDevIndex !== null && projectAnalysis.developerInsights?.[expandedDevIndex] && (
                  <div className="rounded-xl border border-indigo-200 bg-white p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          Exact Findings for {projectAnalysis.developerInsights[expandedDevIndex].developerName}
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Actionable remediations automatically routed to their Developer Dashboard.
                        </p>
                      </div>
                      <button
                        onClick={() => setExpandedDevIndex(null)}
                        className="text-slate-400 hover:text-slate-600 text-xs font-semibold"
                      >
                        Close
                      </button>
                    </div>

                    {projectFindings.filter(
                      (f) =>
                        f.developer?.name?.toLowerCase() ===
                        projectAnalysis.developerInsights[expandedDevIndex].developerName?.toLowerCase()
                    ).length === 0 ? (
                      <p className="text-xs text-slate-500 py-3">
                        No actionable line-by-line remediations logged for this developer yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {projectFindings
                          .filter(
                            (f) =>
                              f.developer?.name?.toLowerCase() ===
                              projectAnalysis.developerInsights[expandedDevIndex].developerName?.toLowerCase()
                          )
                          .map((finding, fIdx) => (
                            <div
                              key={fIdx}
                              className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2.5"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-slate-900 font-mono">
                                    {finding.fileName || "File"} : Line {finding.lineNumber || "N/A"}
                                  </span>
                                  {finding.severity && (
                                    <span
                                      className={`rounded border px-1.5 py-0.2 text-[9px] font-bold ${getSeverityBadge(
                                        finding.severity
                                      )}`}
                                    >
                                      {finding.severity}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase">
                                  {finding.category || "Code Issue"}
                                </span>
                              </div>

                              <p className="text-xs text-slate-700 font-medium">
                                {finding.title || finding.description}
                              </p>

                              {finding.problematicCode && (
                                <div className="rounded-lg bg-slate-900 p-2.5 font-mono text-[11px] text-rose-300 overflow-x-auto">
                                  <code>{finding.problematicCode}</code>
                                </div>
                              )}

                              {finding.suggestedFix && (
                                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 space-y-1.5">
                                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800">
                                    <span className="flex items-center gap-1">
                                      <Wrench size={12} />
                                      <span>Suggested Remediation</span>
                                    </span>
                                    <button
                                      onClick={() => handleCopyCode(finding.suggestedFix, `fix-${fIdx}`)}
                                      className="flex items-center gap-1 text-[10px] text-emerald-700 hover:text-emerald-900 transition"
                                    >
                                      {copiedIndex === `fix-${fIdx}` ? (
                                        <>
                                          <Check size={11} /> Copied
                                        </>
                                      ) : (
                                        <>
                                          <Copy size={11} /> Copy Code
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <pre className="rounded bg-slate-900 p-2.5 font-mono text-[11px] text-emerald-300 overflow-x-auto">
                                    <code>{finding.suggestedFix}</code>
                                  </pre>
                                </div>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* INDIVIDUAL SUBMISSIONS SECTION */}
        {/* ======================================================== */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden space-y-0">
          {/* Header */}
          <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                All Developer Code Submissions
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Inspect individual developer submissions, AI audits, and test coverage scores.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">
                Showing {filteredSubmissions.length} of {submissions.length} modules
              </span>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="grid gap-3 p-4 border-b border-slate-100 bg-white sm:grid-cols-2 md:grid-cols-5">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search file or developer..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filter Project */}
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Filter Developer */}
            <select
              value={selectedDeveloperId}
              onChange={(e) => setSelectedDeveloperId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Developers</option>
              {uniqueDevelopers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.role})
                </option>
              ))}
            </select>

            {/* Filter Language */}
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Languages</option>
              {uniqueLanguages.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="score_high">Highest Score</option>
              <option value="score_low">Lowest Score</option>
            </select>
          </div>

          {/* Submissions Table */}
          <div className="overflow-x-auto">
            {loadingSubmissions ? (
              <div className="py-16 text-center">
                <Loader2 className="animate-spin text-indigo-600 mx-auto mb-2" size={24} />
                <p className="text-xs text-slate-500">Loading submissions...</p>
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="py-16 text-center p-6">
                <FileCode className="mx-auto text-slate-300 mb-2" size={32} />
                <p className="text-xs font-semibold text-slate-700">No matching submissions found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">File &amp; Language</th>
                    <th className="px-6 py-3.5">Developer</th>
                    <th className="px-6 py-3.5">Project</th>
                    <th className="px-6 py-3.5 text-center">Quality Score</th>
                    <th className="px-6 py-3.5">Submitted</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-medium text-slate-700">
                  {filteredSubmissions.map((sub) => (
                    <tr key={sub._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-mono text-[10px] font-bold">
                            {(sub.language || "JS").slice(0, 3).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{sub.fileName}</p>
                            <p className="text-[10px] text-slate-400">{sub.language}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">{sub.developer?.name || "Developer"}</p>
                        <p className="text-[10px] text-slate-400">{sub.developer?.role || ""}</p>
                      </td>

                      <td className="px-6 py-4">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {sub.project?.name || "DevFlow Project"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block rounded-md border px-2 py-0.5 text-xs font-black ${getScoreColor(
                            sub.qualityScore
                          )}`}
                        >
                          {sub.qualityScore ?? "--"}/100
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-500 text-[11px]">
                        {new Date(sub.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setActiveModal("code");
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-xs"
                          >
                            Code
                          </button>

                          <button
                            onClick={() => {
                              setSelectedSubmission(sub);
                              setActiveModal("report");
                            }}
                            className="rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                          >
                            AI Report
                          </button>

                          <button
                            onClick={() => handleAnalyzeSubmission(sub._id)}
                            disabled={analyzingSubmissionId === sub._id}
                            title="Re-analyze submission"
                            className="rounded-lg border border-slate-200 bg-white p-1 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition disabled:opacity-40"
                          >
                            <RefreshCw size={13} className={analyzingSubmissionId === sub._id ? "animate-spin" : ""} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {/* ======================================================== */}
      {/* MODAL: VIEW CODE */}
      {/* ======================================================== */}
      {activeModal === "code" && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedSubmission.fileName}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Developer: {selectedSubmission.developer?.name} &bull; Language: {selectedSubmission.language}
                </p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-slate-900 text-slate-100 rounded-b-none font-mono text-xs">
              <pre className="whitespace-pre-wrap leading-relaxed">
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-white rounded-b-2xl">
              <button
                onClick={() => handleCopyCode(selectedSubmission.code, "modal-code")}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                {copiedIndex === "modal-code" ? <Check size={13} /> : <Copy size={13} />}
                <span>Copy Code</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveModal("report")}
                  className="rounded-xl bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                >
                  View AI Report
                </button>
                <button
                  onClick={() => setActiveModal(null)}
                  className="rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VIEW FULL REPORT */}
      {/* ======================================================== */}
      {activeModal === "report" && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl border font-black ${getScoreColor(
                    selectedSubmission.qualityScore
                  )}`}
                >
                  <span className="text-sm font-bold">{selectedSubmission.qualityScore}</span>
                  <span className="text-[8px] uppercase">/ 100</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {selectedSubmission.fileName} AI Code Review
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Developer: {selectedSubmission.developer?.name} ({selectedSubmission.developer?.role}) &bull; Project: {selectedSubmission.project?.name || "Project"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {/* Summary */}
              {selectedSubmission.summary && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Code Summary
                  </h4>
                  <p className="text-xs leading-relaxed text-slate-700">
                    {selectedSubmission.summary}
                  </p>
                </div>
              )}

              {/* Errors */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>Errors &amp; Critical Issues ({selectedSubmission.errors?.length || 0})</span>
                </h4>
                {selectedSubmission.errors?.length > 0 ? (
                  <ul className="space-y-1.5">
                    {selectedSubmission.errors.map((err, idx) => (
                      <li key={idx} className="rounded-lg border border-rose-200 bg-white p-2.5 text-xs text-rose-900">
                        {err}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-emerald-700 font-medium">No critical errors detected.</p>
                )}
              </div>

              {/* Warnings */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <AlertTriangle size={14} />
                  <span>Warnings &amp; Code Smells ({selectedSubmission.warnings?.length || 0})</span>
                </h4>
                {selectedSubmission.warnings?.length > 0 ? (
                  <ul className="space-y-1.5">
                    {selectedSubmission.warnings.map((warn, idx) => (
                      <li key={idx} className="rounded-lg border border-amber-200 bg-white p-2.5 text-xs text-amber-900">
                        {warn}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-500 font-medium">No code smells or major warnings detected.</p>
                )}
              </div>

              {/* Suggestions */}
              {selectedSubmission.suggestions?.length > 0 && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                    <Lightbulb size={14} />
                    <span>Suggestions ({selectedSubmission.suggestions.length})</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedSubmission.suggestions.map((sug, idx) => (
                      <li key={idx} className="rounded-lg border border-indigo-200 bg-white p-2.5 text-xs text-indigo-900">
                        {sug}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Analysis */}
              {selectedSubmission.aiAnalysis && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Detailed AI Review
                  </h4>
                  <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700">
                    {selectedSubmission.aiAnalysis}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-white rounded-b-2xl">
              <button
                onClick={() => setActiveModal("code")}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <Eye size={13} />
                <span>View Submitted Code</span>
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}