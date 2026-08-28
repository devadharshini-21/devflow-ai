import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FolderKanban, Plus, Loader2, Calendar, Layers, X, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function ManagerProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    technologyStack: "",
    deadline: "",
  });

  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects");
      setProjects(response.data.projects || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load projects"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const createProject = async (e) => {
    e.preventDefault();

    if (!form.name || !form.description) {
      toast.error("Project name and description are required");
      return;
    }

    try {
      const response = await api.post("/projects", {
        name: form.name,
        description: form.description,
        technologyStack: form.technologyStack
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        deadline: form.deadline || undefined,
      });

      setProjects((prev) => [response.data.project, ...prev]);

      setForm({
        name: "",
        description: "",
        technologyStack: "",
        deadline: "",
      });

      setShowForm(false);
      toast.success("Project created successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create project"
      );
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "active":
      case "in progress":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "planning":
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 page-enter">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 bg-white px-8 py-5">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600">
              Project Manager
            </p>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Projects
            </h1>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 hover:-translate-y-0.5"
          >
            <Plus size={15} />
            <span>Create Project</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8 max-w-7xl mx-auto space-y-6">
        {/* Create Project Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <FolderKanban size={18} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    Create New Project
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={createProject} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Project Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. E-Commerce Platform"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Technology Stack (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="technologyStack"
                    value={form.technologyStack}
                    onChange={handleChange}
                    placeholder="React, Node.js, MongoDB, Express"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Description <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="3"
                    required
                    placeholder="Describe project objectives and scope..."
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Target Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={form.deadline}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-xs"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600 mb-2" size={28} />
            <p className="text-xs text-slate-500">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <FolderKanban className="mx-auto text-slate-400 mb-3" size={36} />
            <h3 className="text-base font-bold text-slate-900">No projects yet</h3>
            <p className="mt-1 max-w-sm mx-auto text-xs text-slate-500">
              Create your first software project to start assigning tasks and collaborating with your team.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition"
            >
              <Plus size={14} />
              <span>Create Project</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project._id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <FolderKanban size={18} />
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(
                        project.status
                      )}`}
                    >
                      {project.status || "Planning"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      {project.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Tech stack */}
                  {project.technologyStack?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {project.technologyStack.map((tech, i) => (
                        <span
                          key={i}
                          className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-400" />
                    <span>
                      {project.deadline
                        ? new Date(project.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "No deadline"}
                    </span>
                  </div>

                  <Link
                    to="/dashboard/project-manager/tasks"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                  >
                    <span>Tasks</span>
                    <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}