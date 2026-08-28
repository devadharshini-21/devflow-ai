import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Upload,
  Code2,
  AlertCircle,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Loader2,
  FileCode,
  History,
  ShieldCheck,
  Zap,
  Eye,
  X,
  RefreshCw,
  FolderKanban,
  Copy,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

const PROGRAMMING_LANGUAGES = [
  { value: "javascript", label: "JavaScript (JSX/Node)" },
  { value: "typescript", label: "TypeScript (TSX)" },
  { value: "python", label: "Python" },
  { value: "html", label: "HTML / CSS" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++ / C" },
  { value: "csharp", label: "C#" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "php", label: "PHP" },
  { value: "sql", label: "SQL" },
  { value: "other", label: "Other" },
];

export default function DeveloperAICode() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || "Frontend Developer";

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [activeTab, setActiveTab] = useState("analyze"); // 'analyze' | 'history'

  // Form State
  const [selectedProject, setSelectedProject] = useState("");
  const [fileName, setFileName] = useState("Login.jsx");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(`function Login() {
  const password = "admin123";

  if (password == "admin123") {
    console.log("Login successful");
  }

  return <div>Login</div>;
}`);

  // Analysis State
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);

  // History State
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  // Detail Modal State
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'analysis' | 'code' | null
  const [copiedModalCode, setCopiedModalCode] = useState(false);

  // Load Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await api.get("/projects");
        const projectList = response.data.projects || [];
        setProjects(projectList);
        if (projectList.length > 0) {
          setSelectedProject(projectList[0]._id);
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch History (Developer Submissions)
  const fetchHistory = async () => {
    setLoadingHistory(true);
    setHistoryError(null);
    try {
      const response = await api.get("/code/my");
      setHistory(response.data.submissions || []);
    } catch (error) {
      console.error("Fetch history error:", error);
      setHistoryError(
        error.response?.data?.message || "Unable to load your submissions. Please try again."
      );
      toast.error("Unable to load your submissions. Please try again.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  // Handle File Upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be under 2MB");
      return;
    }

    setFileName(file.name);

    // Auto-detect language
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (["js", "jsx", "mjs"].includes(ext)) setLanguage("javascript");
    else if (["ts", "tsx"].includes(ext)) setLanguage("typescript");
    else if (["py"].includes(ext)) setLanguage("python");
    else if (["html", "htm", "css"].includes(ext)) setLanguage("html");
    else if (["java"].includes(ext)) setLanguage("java");
    else if (["cpp", "c", "h", "hpp"].includes(ext)) setLanguage("cpp");
    else if (["go"].includes(ext)) setLanguage("go");
    else if (["rs"].includes(ext)) setLanguage("rust");
    else if (["php"].includes(ext)) setLanguage("php");
    else if (["sql"].includes(ext)) setLanguage("sql");

    const reader = new FileReader();
    reader.onload = (event) => {
      setCode(event.target?.result || "");
      toast.success(`Loaded ${file.name}`);
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
    };
    reader.readAsText(file);
  };

  // Submit and Analyze Code
  const handleAnalyze = async (e) => {
    e.preventDefault();

    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }

    if (!fileName.trim()) {
      toast.error("Please provide a file name");
      return;
    }

    if (!code.trim()) {
      toast.error("Please enter or upload code to analyze");
      return;
    }

    setAnalyzing(true);
    setCurrentAnalysis(null);

    try {
      const response = await api.post("/code", {
        project: selectedProject,
        fileName: fileName.trim(),
        language,
        code,
      });

      const submission = response.data.submission;
      setCurrentAnalysis(submission);
      toast.success("AI Code Analysis completed!");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(
        error.response?.data?.message || "AI Analysis failed. Please check backend configuration."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-700 bg-amber-50 border-amber-200";
    return "text-rose-700 bg-rose-50 border-rose-200";
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return "Production Ready";
    if (score >= 70) return "Minor Issues";
    if (score >= 50) return "Needs Refactoring";
    return "Critical Issues";
  };

  const handleCopyCode = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedModalCode(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedModalCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 page-enter">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white px-8 py-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600">
            {role} Workspace
          </p>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            AI Code Studio &amp; Review
          </h1>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab("analyze")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "analyze"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Sparkles size={13} />
            <span>Analyze Code</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
              activeTab === "history"
                ? "bg-white text-indigo-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <History size={13} />
            <span>My Submissions</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {activeTab === "analyze" ? (
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Code Input Form (Left 6 cols) */}
            <div className="space-y-6 lg:col-span-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Code2 size={20} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Submit Code for AI Review</h2>
                      <p className="text-[11px] text-slate-500">Gemini will evaluate syntax, security, and quality score</p>
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 shadow-xs">
                    <Upload size={13} />
                    <span>Upload</span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".js,.jsx,.ts,.tsx,.py,.html,.css,.json,.java,.cpp,.c,.h,.go,.rs,.php,.sql,.txt"
                    />
                  </label>
                </div>

                <form onSubmit={handleAnalyze} className="space-y-4">
                  {/* Project Selector */}
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-700">
                      Target Project <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      disabled={loadingProjects}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-900 outline-none transition focus:border-indigo-500 cursor-pointer"
                    >
                      {loadingProjects ? (
                        <option>Loading projects...</option>
                      ) : projects.length === 0 ? (
                        <option value="">No projects assigned yet.</option>
                      ) : (
                        projects.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.status || "Active"})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* File Name & Language Grid */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        File Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <FileCode
                          size={15}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="text"
                          value={fileName}
                          onChange={(e) => setFileName(e.target.value)}
                          placeholder="e.g. Login.jsx"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 outline-none transition focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-slate-700">
                        Programming Language
                      </label>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none transition focus:border-indigo-500 cursor-pointer"
                      >
                        {PROGRAMMING_LANGUAGES.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Code Editor Area */}
                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700">
                        Source Code <span className="text-rose-500">*</span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {code.split("\n").length} lines &bull; {code.length} chars
                      </span>
                    </div>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      rows={14}
                      placeholder="Paste your source code here..."
                      spellCheck="false"
                      className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3.5 font-mono text-xs leading-relaxed text-indigo-100 outline-none transition focus:border-indigo-500 shadow-inner"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={analyzing || loadingProjects || !selectedProject}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="animate-spin" size={15} />
                        <span>Analyzing Code with Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={15} />
                        <span>Run AI Code Analysis</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Analysis Results (Right 6 cols) */}
            <div className="space-y-6 lg:col-span-6">
              {analyzing ? (
                <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50/40 p-8 text-center">
                  <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/10 text-indigo-600">
                    <Loader2 className="animate-spin" size={28} />
                    <Sparkles className="absolute right-1 top-1 text-indigo-500" size={13} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Reviewing Your Implementation</h3>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-600">
                    Gemini is examining syntax, checking security vulnerabilities, evaluating code smells, and generating remediation insights...
                  </p>
                </div>
              ) : currentAnalysis ? (
                <div className="space-y-5">
                  {/* Quality Score Header Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                            Assessment
                          </span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            {currentAnalysis.fileName}
                          </span>
                        </div>
                        <h2 className="mt-0.5 text-xl font-bold text-slate-900">
                          {getScoreLabel(currentAnalysis.qualityScore)}
                        </h2>
                        <p className="text-[11px] text-slate-500">
                          Project: {currentAnalysis.project?.name || "DevFlow Project"}
                        </p>
                      </div>

                      <div
                        className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border ${getScoreColor(
                          currentAnalysis.qualityScore
                        )}`}
                      >
                        <span className="text-xl font-black">{currentAnalysis.qualityScore}</span>
                        <span className="text-[8px] uppercase">/ 100</span>
                      </div>
                    </div>

                    {/* Summary */}
                    {currentAnalysis.summary && (
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                          Executive Summary
                        </h4>
                        <p className="text-xs leading-relaxed text-slate-700">
                          {currentAnalysis.summary}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Errors */}
                  <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                      <AlertCircle size={15} />
                      <span>Errors &amp; Critical Issues ({currentAnalysis.errors?.length || 0})</span>
                    </h4>
                    {currentAnalysis.errors?.length > 0 ? (
                      <ul className="space-y-1.5">
                        {currentAnalysis.errors.map((err, idx) => (
                          <li key={idx} className="rounded-xl border border-rose-200 bg-white p-3 text-xs text-rose-900">
                            {err}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-emerald-700 font-medium">No critical errors detected.</p>
                    )}
                  </div>

                  {/* Warnings */}
                  <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <AlertTriangle size={15} />
                      <span>Warnings ({currentAnalysis.warnings?.length || 0})</span>
                    </h4>
                    {currentAnalysis.warnings?.length > 0 ? (
                      <ul className="space-y-1.5">
                        {currentAnalysis.warnings.map((warn, idx) => (
                          <li key={idx} className="rounded-xl border border-amber-200 bg-white p-3 text-xs text-amber-900">
                            {warn}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-500 font-medium">No major code smells or warnings.</p>
                    )}
                  </div>

                  {/* Suggestions */}
                  {currentAnalysis.suggestions?.length > 0 && (
                    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                        <Lightbulb size={15} />
                        <span>Improvement Suggestions ({currentAnalysis.suggestions.length})</span>
                      </h4>
                      <ul className="space-y-1.5">
                        {currentAnalysis.suggestions.map((sug, idx) => (
                          <li key={idx} className="rounded-xl border border-indigo-200 bg-white p-3 text-xs text-indigo-900">
                            {sug}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* AI Review Text */}
                  {currentAnalysis.aiAnalysis && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <ShieldCheck size={15} className="text-indigo-600" />
                        <span>Comprehensive Architectural Review</span>
                      </h4>
                      <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700">
                        {currentAnalysis.aiAnalysis}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex min-h-[460px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Sparkles size={24} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Ready to Analyze</h3>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
                    Select your project, paste or upload your code file, and click &quot;Run AI Code Analysis&quot; to review your code.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Submissions History Tab */
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden space-y-0">
            <div className="flex items-center justify-between border-b border-slate-100 p-6 bg-slate-50/50">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  My Code Submissions
                </h2>
                <p className="text-xs text-slate-500">
                  History of your analyzed modules and quality ratings
                </p>
              </div>

              <button
                onClick={fetchHistory}
                disabled={loadingHistory}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
              >
                <RefreshCw size={13} className={loadingHistory ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {loadingHistory ? (
                <div className="py-16 text-center">
                  <Loader2 className="animate-spin text-indigo-600 mx-auto mb-2" size={24} />
                  <p className="text-xs text-slate-500">Loading submissions...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="py-16 text-center p-6">
                  <FileCode className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-xs font-semibold text-slate-700">No submissions found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Submit your first code file from the &quot;Analyze Code&quot; tab.</p>
                </div>
              ) : (
                history.map((sub) => (
                  <div
                    key={sub._id}
                    className="p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm truncate">{sub.fileName}</h3>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          {sub.language}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Project: <strong className="text-slate-700">{sub.project?.name || "Project"}</strong> &bull; Submitted on {new Date(sub.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`rounded-md border px-2.5 py-1 text-xs font-black ${getScoreColor(
                          sub.qualityScore
                        )}`}
                      >
                        {sub.qualityScore ?? "--"}/100
                      </span>

                      <button
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setActiveModal("code");
                        }}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs"
                      >
                        View Code
                      </button>

                      <button
                        onClick={() => {
                          setSelectedSubmission(sub);
                          setActiveModal("analysis");
                        }}
                        className="rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                      >
                        AI Report
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal: View Code */}
      {activeModal === "code" && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{selectedSubmission.fileName}</h3>
                <p className="text-[11px] text-slate-500">Language: {selectedSubmission.language}</p>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 bg-slate-900 text-slate-100 font-mono text-xs">
              <pre className="whitespace-pre-wrap leading-relaxed">
                <code>{selectedSubmission.code}</code>
              </pre>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-white rounded-b-2xl">
              <button
                onClick={() => handleCopyCode(selectedSubmission.code)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                {copiedModalCode ? <Check size={13} /> : <Copy size={13} />}
                <span>Copy Code</span>
              </button>
              <button
                onClick={() => setActiveModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View AI Analysis */}
      {activeModal === "analysis" && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
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
                  <h3 className="text-sm font-bold text-slate-900">{selectedSubmission.fileName} Review</h3>
                  <p className="text-[11px] text-slate-500">Project: {selectedSubmission.project?.name || "Project"}</p>
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
              {selectedSubmission.summary && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Summary</h4>
                  <p className="text-xs text-slate-700">{selectedSubmission.summary}</p>
                </div>
              )}

              {selectedSubmission.errors?.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800">Errors</h4>
                  <ul className="space-y-1">
                    {selectedSubmission.errors.map((err, idx) => (
                      <li key={idx} className="text-xs text-rose-900 bg-white p-2 rounded-lg border border-rose-200">
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedSubmission.aiAnalysis && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">AI Review</h4>
                  <p className="whitespace-pre-line text-xs leading-relaxed text-slate-700">
                    {selectedSubmission.aiAnalysis}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end border-t border-slate-100 p-4 bg-white rounded-b-2xl">
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