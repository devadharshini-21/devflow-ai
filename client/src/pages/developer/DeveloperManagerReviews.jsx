import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  FolderKanban,
  Clock,
  User,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Code2,
  Wrench,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  RefreshCw,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  Copy,
  Check,
  MapPin,
  CheckCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function DeveloperManagerReviews() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || "Frontend Developer";

  let basePath = "/dashboard/developer";
  if (window.location.pathname.startsWith("/dashboard/frontend")) basePath = "/dashboard/frontend";
  else if (window.location.pathname.startsWith("/dashboard/backend")) basePath = "/dashboard/backend";
  else if (window.location.pathname.startsWith("/dashboard/uiux")) basePath = "/dashboard/uiux";
  else if (window.location.pathname.startsWith("/dashboard/qa")) basePath = "/dashboard/qa";

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtering
  const [selectedProjectFilter, setSelectedProjectFilter] = useState("ALL");

  // Expanded card review IDs on main list
  const [expandedCardIds, setExpandedCardIds] = useState(new Set());

  // Detailed Modal View
  const [selectedReview, setSelectedReview] = useState(null);
  const [expandedModalFindings, setExpandedModalFindings] = useState(new Set());
  const [copiedCodeId, setCopiedCodeId] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/code/my-manager-reviews");
      const reviewList = res.data.reviews || [];
      setReviews(reviewList);

      // Auto expand the first card if it has findings
      if (reviewList.length > 0 && reviewList[0].findings?.length > 0) {
        setExpandedCardIds(new Set([reviewList[0].analysisId]));
      }
    } catch (err) {
      console.error("Fetch Manager Reviews Error:", err);
      setError(
        err.response?.data?.message || "Unable to load Manager AI Reviews. Please try again."
      );
      toast.error("Unable to load Manager AI Reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getSeverityBadge = (severity) => {
    switch (severity?.toUpperCase()) {
      case "CRITICAL":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "LOW":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-700 border-emerald-200 bg-emerald-50";
    if (score >= 60) return "text-amber-700 border-amber-200 bg-amber-50";
    return "text-rose-700 border-rose-200 bg-rose-50";
  };

  // Toggle expanding a review card on the main page
  const toggleCardExpansion = (analysisId) => {
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(analysisId)) next.delete(analysisId);
      else next.add(analysisId);
      return next;
    });
  };

  const handleOpenReviewModal = (review) => {
    setSelectedReview(review);
    if (review.findings && review.findings.length > 0) {
      setExpandedModalFindings(new Set(review.findings.map((f, i) => f._id || String(i))));
    } else {
      setExpandedModalFindings(new Set());
    }
  };

  const toggleModalFinding = (id) => {
    setExpandedModalFindings((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCopyCode = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    toast.success("Corrected code copied to clipboard!");
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Distinct projects for filter dropdown
  const distinctProjects = Array.from(
    new Map(reviews.map((r) => [r.project?._id, r.project])).values()
  ).filter(Boolean);

  const filteredReviews = reviews.filter((r) => {
    if (selectedProjectFilter === "ALL") return true;
    return r.project?._id === selectedProjectFilter;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 page-enter">
      {/* =================================================
          HEADER
      ================================================= */}
      <header className="border-b border-slate-200/80 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-8 py-5 max-w-7xl mx-auto">
          <div>
            <p className="text-xs uppercase tracking-wider text-indigo-600 font-semibold">
              {role} Workspace
            </p>
            <h1 className="mt-0.5 text-xl font-bold flex items-center gap-2.5 text-slate-900 tracking-tight">
              <span>Manager AI Reviews</span>
              <span className="rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                Actionable Error Suggestions
              </span>
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Use the down arrow on any review to see exactly where errors occurred and what corrected approach AI suggests.
            </p>
          </div>

          <button
            onClick={fetchReviews}
            disabled={loading}
            className="self-start md:self-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Refresh Reviews</span>
          </button>
        </div>
      </header>

      {/* =================================================
          CONTENT
      ================================================= */}
      <main className="px-8 py-8 max-w-7xl mx-auto space-y-6">
        {/* Project Filter Toolbar */}
        {reviews.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
              <Sparkles size={16} className="text-indigo-600" />
              <span>
                Viewing {filteredReviews.length} Manager Review{filteredReviews.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Filter size={14} className="text-slate-400" />
              <label className="text-xs text-slate-500 font-semibold">Filter Project:</label>
              <select
                value={selectedProjectFilter}
                onChange={(e) => setSelectedProjectFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Projects ({reviews.length})</option>
                {distinctProjects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="animate-spin text-indigo-600 mb-3" size={32} />
            <p className="text-xs text-slate-500">Loading Manager AI Reviews...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-6 text-center space-y-3">
            <AlertCircle size={32} className="mx-auto text-rose-500" />
            <h3 className="text-sm font-bold text-rose-900">Failed to load reviews</h3>
            <p className="text-xs text-rose-700">{error}</p>
            <button
              onClick={fetchReviews}
              className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition shadow-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredReviews.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Sparkles size={28} />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              No Manager AI Reviews Yet
            </h3>
            <p className="max-w-md mx-auto text-xs text-slate-500 leading-relaxed">
              When your project manager executes an Overall AI Project Analysis, any actionable findings specific to your code submissions will be displayed here with suggested remediations.
            </p>
            <div className="pt-2">
              <Link
                to={`${basePath}/ai-code`}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-xs"
              >
                <span>Submit Code to Studio</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        )}

        {/* Review Cards List with Down Arrow Accordions */}
        {!loading && !error && filteredReviews.length > 0 && (
          <div className="space-y-6">
            {filteredReviews.map((review) => {
              const findingsCount = review.developerIssuesCount || review.findings?.length || 0;
              const hasFindings = findingsCount > 0;
              const isCardExpanded = expandedCardIds.has(review.analysisId);

              return (
                <div
                  key={review.analysisId}
                  className={`rounded-2xl border bg-white shadow-sm transition-all duration-200 overflow-hidden ${
                    isCardExpanded ? "border-indigo-300 ring-2 ring-indigo-500/10 shadow-md" : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {/* Card Header Section */}
                  <div className="p-6 space-y-4">
                    {/* Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                          <FolderKanban size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-base text-slate-900">
                              {review.project?.name || "Project Analysis"}
                            </h3>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ({formatTimestamp(review.analyzedAt)})
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {review.analyzedBy?.name ? `Audited by Project Manager ${review.analyzedBy.name}` : "Manager Code Audit"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-bold ${
                            hasFindings
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {hasFindings ? `${findingsCount} Actionable Error${findingsCount === 1 ? "" : "s"}` : "No Code Issues"}
                        </span>
                      </div>
                    </div>

                    {/* Scores & Metrics Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Your Module Score
                        </span>
                        <p className={`text-lg font-black mt-0.5 ${getScoreColor(review.developerScore || 0)}`}>
                          {review.developerScore ?? "--"}%
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Overall Project Score
                        </span>
                        <p className={`text-lg font-black mt-0.5 ${getScoreColor(review.overallQualityScore || 0)}`}>
                          {review.overallQualityScore ?? "--"}%
                        </p>
                      </div>

                      <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Health Status
                        </span>
                        <p className="text-sm font-bold text-slate-800 mt-1">
                          {review.healthStatus || (review.overallQualityScore >= 80 ? "Good" : "Needs Attention")}
                        </p>
                      </div>
                    </div>

                    {/* Project Summary snippet */}
                    {review.projectSummary && (
                      <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <strong className="text-slate-800">Manager Audit Summary:</strong> {review.projectSummary}
                      </p>
                    )}

                    {/* Down Arrow Toggle Button & Modal Button */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                      {/* Down Arrow Expand Button */}
                      <button
                        type="button"
                        onClick={() => toggleCardExpansion(review.analysisId)}
                        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shadow-xs ${
                          isCardExpanded
                            ? "bg-indigo-600 text-white hover:bg-indigo-500"
                            : "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                        }`}
                      >
                        <span>
                          {isCardExpanded ? "Hide Errors & Suggested Approaches" : "Show Where Errors Occurred & Suggested Fixes"}
                        </span>
                        {isCardExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} className="animate-bounce" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenReviewModal(review)}
                        className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
                      >
                        <span>Open Full Audit View</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>

                  {/* =====================================================
                      ACCORDION EXPANDED CONTENT (DOWN ARROW VIEW)
                  ===================================================== */}
                  {isCardExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50/60 p-6 space-y-5">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                          <Wrench size={16} className="text-indigo-600" />
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                            Suggested Remediations ({review.findings?.length || 0})
                          </h4>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Exact location &amp; corrected implementation
                        </span>
                      </div>

                      {(!review.findings || review.findings.length === 0) ? (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-5 text-center">
                          <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-1" />
                          <p className="text-xs font-bold text-emerald-900">No Actionable Errors in Your Code</p>
                          <p className="text-[11px] text-emerald-700 mt-0.5">Your submitted modules passed the manager quality check cleanly.</p>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          {review.findings.map((finding, idx) => (
                            <div
                              key={finding._id || idx}
                              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4"
                            >
                              {/* Header with File & Severity */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                                    <FileCode size={13} />
                                    <span>{finding.fileName || "Module"} : Line {finding.lineNumber || "N/A"}</span>
                                  </span>
                                  {finding.severity && (
                                    <span
                                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getSeverityBadge(
                                        finding.severity
                                      )}`}
                                    >
                                      {finding.severity} Severity
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {finding.category || "Code Issue"}
                                </span>
                              </div>

                              {/* Error Title & Description */}
                              <div className="space-y-1">
                                <h5 className="font-bold text-sm text-slate-900">
                                  {finding.title || finding.description}
                                </h5>
                                {finding.description && finding.title && (
                                  <p className="text-xs text-slate-600 leading-relaxed">
                                    {finding.description}
                                  </p>
                                )}
                              </div>

                              {/* 1. WHERE ERROR OCCURRED */}
                              {finding.problematicCode && (
                                <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3.5 space-y-2">
                                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                                    <MapPin size={14} className="text-rose-600" />
                                    <span>📍 Where Error Occurred ({finding.fileName} : Line {finding.lineNumber || "N/A"})</span>
                                  </div>
                                  <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-rose-300 overflow-x-auto shadow-inner">
                                    <code>{finding.problematicCode}</code>
                                  </div>
                                </div>
                              )}

                              {/* 2. CORRECTED / SUGGESTED APPROACH */}
                              {finding.suggestedFix && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 space-y-2">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                                      <CheckCircle size={14} className="text-emerald-600" />
                                      <span>✅ Corrected / Suggested Approach</span>
                                    </div>

                                    {/* 1-Click Copy Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCode(finding.suggestedFix, `card-fix-${idx}`)}
                                      className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 px-2.5 py-1 rounded-lg hover:bg-emerald-100 transition shadow-2xs"
                                    >
                                      {copiedCodeId === `card-fix-${idx}` ? (
                                        <>
                                          <Check size={12} className="text-emerald-600" />
                                          <span>Copied!</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy size={12} />
                                          <span>Copy Corrected Code</span>
                                        </>
                                      )}
                                    </button>
                                  </div>

                                  <pre className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-emerald-300 overflow-x-auto shadow-inner">
                                    <code>{finding.suggestedFix}</code>
                                  </pre>
                                </div>
                              )}

                              {/* Explanation: Why this fix is recommended */}
                              {finding.explanation && (
                                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 leading-relaxed">
                                  <strong className="text-slate-800 block mb-0.5">💡 Why this corrected approach is recommended:</strong>
                                  {finding.explanation}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* =================================================
          DETAILED AUDIT MODAL (FULL EXPANDED VIEW)
      ================================================= */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5 bg-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedReview.project?.name || "Project"} &bull; Manager AI Audit
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Generated on {formatTimestamp(selectedReview.analyzedAt)} &bull; Audited by {selectedReview.analyzedBy?.name || "Project Manager"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReview(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 space-y-5 overflow-y-auto p-6 bg-[#FAFAFA]">
              {/* Executive Summary */}
              {selectedReview.projectSummary && (
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    Project AI Executive Summary
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-700">
                    {selectedReview.projectSummary}
                  </p>
                </div>
              )}

              {/* Exact Findings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                    <Wrench size={14} className="text-indigo-600" />
                    <span>Exact Actionable Remediations ({selectedReview.findings?.length || 0})</span>
                  </h3>
                  <span className="text-[10px] text-slate-400">
                    Filtered strictly for your submitted code
                  </span>
                </div>

                {(!selectedReview.findings || selectedReview.findings.length === 0) ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 text-center">
                    <CheckCircle2 size={24} className="mx-auto text-emerald-600 mb-1" />
                    <p className="text-xs font-bold text-emerald-900">No Actionable Issues Detected</p>
                    <p className="text-[11px] text-emerald-700 mt-0.5">Your submitted code passed the manager project audit cleanly.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedReview.findings.map((f, idx) => {
                      const fId = f._id || String(idx);
                      const isExpanded = expandedModalFindings.has(fId);

                      return (
                        <div
                          key={fId}
                          className="rounded-xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs"
                        >
                          <div
                            onClick={() => toggleModalFinding(fId)}
                            className="flex cursor-pointer items-start justify-between gap-3"
                          >
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                                  {f.fileName || "File"} : Line {f.lineNumber || "N/A"}
                                </span>
                                {f.severity && (
                                  <span
                                    className={`rounded border px-1.5 py-0.2 text-[9px] font-bold ${getSeverityBadge(
                                      f.severity
                                    )}`}
                                  >
                                    {f.severity}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs font-bold text-slate-900">
                                {f.title || f.description}
                              </p>
                            </div>

                            <button className="text-slate-400 hover:text-slate-600 p-1">
                              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="space-y-3 border-t border-slate-100 pt-3">
                              {/* 1. WHERE ERROR OCCURRED */}
                              {f.problematicCode && (
                                <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-3 space-y-1.5">
                                  <div className="flex items-center gap-1 text-xs font-bold text-rose-800">
                                    <MapPin size={13} className="text-rose-600" />
                                    <span>📍 Where Error Occurred ({f.fileName} : Line {f.lineNumber || "N/A"})</span>
                                  </div>
                                  <div className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-rose-300 overflow-x-auto shadow-inner">
                                    <code>{f.problematicCode}</code>
                                  </div>
                                </div>
                              )}

                              {/* 2. CORRECTED / SUGGESTED APPROACH */}
                              {f.suggestedFix && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-800">
                                      <CheckCircle size={13} className="text-emerald-600" />
                                      <span>✅ Corrected / Suggested Approach</span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyCode(f.suggestedFix, `modal-fix-${idx}`)}
                                      className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 px-2 py-0.5 rounded hover:bg-emerald-100 transition shadow-2xs"
                                    >
                                      {copiedCodeId === `modal-fix-${idx}` ? (
                                        <>
                                          <Check size={11} className="text-emerald-600" /> Copied!
                                        </>
                                      ) : (
                                        <>
                                          <Copy size={11} /> Copy Code
                                        </>
                                      )}
                                    </button>
                                  </div>
                                  <pre className="rounded-lg bg-slate-900 p-3 font-mono text-xs text-emerald-300 overflow-x-auto shadow-inner">
                                    <code>{f.suggestedFix}</code>
                                  </pre>
                                </div>
                              )}

                              {/* EXPLANATION */}
                              {f.explanation && (
                                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600 leading-relaxed">
                                  <strong className="text-slate-800 block mb-0.5">💡 Why this corrected approach is recommended:</strong>
                                  {f.explanation}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end border-t border-slate-100 p-4 bg-white rounded-b-2xl">
              <button
                onClick={() => setSelectedReview(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
