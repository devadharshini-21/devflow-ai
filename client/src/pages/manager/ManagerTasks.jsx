import { useEffect, useState, useCallback } from "react";
import {
  CheckSquare,
  Plus,
  Loader2,
  FolderKanban,
  User as UserIcon,
  Calendar,
  X,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function ManagerTasks() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [team, setTeam] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Dedicated Project Selector state for the task list
  const [selectedFilterProjectId, setSelectedFilterProjectId] = useState("ALL");

  const [showForm, setShowForm] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    project: "",
    assignedTo: "",
    priority: "Medium",
    dueDate: "",
  });

  // Load all tasks or project tasks
  const fetchTasksForFilter = useCallback(async (filterProjId) => {
    setLoadingTasks(true);
    try {
      if (!filterProjId || filterProjId === "ALL") {
        const res = await api.get("/tasks/all");
        setTasks(res.data.tasks || []);
      } else {
        const res = await api.get(`/tasks/project/${filterProjId}`);
        setTasks(res.data.tasks || []);
      }
    } catch (error) {
      console.error("Failed to load tasks:", error);
      toast.error(error.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoadingTasks(false);
    }
  }, []);

  // Initial Data Load (Projects, Team, Tasks)
  const loadInitialData = async () => {
    try {
      const [projectRes, teamRes] = await Promise.all([
        api.get("/projects"),
        api.get("/users/team"),
      ]);

      const projectList = projectRes.data.projects || [];
      const teamList = teamRes.data.users || teamRes.data.team || [];

      setProjects(projectList);
      setTeam(teamList);

      if (projectList.length > 0) {
        setForm((prev) => ({
          ...prev,
          project: prev.project || projectList[0]._id,
        }));
      }

      await fetchTasksForFilter("ALL");
    } catch (error) {
      console.error("Failed to load manager data:", error);
      toast.error(error.response?.data?.message || "Failed to load manager data");
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleFilterProjectChange = (e) => {
    const projId = e.target.value;
    setSelectedFilterProjectId(projId);
    fetchTasksForFilter(projId);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const createTask = async (e) => {
    e.preventDefault();

    if (!form.title || !form.project || !form.assignedTo) {
      toast.error("Title, project, and developer are required");
      return;
    }

    setCreatingTask(true);
    try {
      const response = await api.post("/tasks", form);
      const newTask = response.data.task;

      // Update current list if it matches current filter
      if (
        selectedFilterProjectId === "ALL" ||
        selectedFilterProjectId === form.project
      ) {
        setTasks((prev) => [newTask, ...prev]);
      }

      setForm({
        title: "",
        description: "",
        project: form.project,
        assignedTo: "",
        priority: "Medium",
        dueDate: "",
      });

      setShowForm(false);
      toast.success("Task assigned successfully!");
    } catch (error) {
      console.error("Task creation error:", error);
      toast.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setCreatingTask(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Review":
        return "bg-violet-50 text-violet-700 border-violet-200";
      case "In Progress":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      default:
        return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getPriorityColor = (priority) => {
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
              Tasks Backlog &amp; Assignments
            </h1>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 transition hover:bg-indigo-500 hover:-translate-y-0.5"
          >
            <Plus size={15} />
            <span>{showForm ? "Close Form" : "Assign Task"}</span>
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        {/* Task Assignment Modal/Card */}
        {showForm && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Plus size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Assign New Task
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

            <form onSubmit={createTask} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Task Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="e.g. Build Checkout & Payment Gateway Integration"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Target Project <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="project"
                    value={form.project}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">Select project...</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Assign Developer <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="assignedTo"
                    value={form.assignedTo}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">Select developer...</option>
                    {team.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name} &bull; {member.role} ({member.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Priority Level
                  </label>
                  <select
                    name="priority"
                    value={form.priority}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3 text-xs text-slate-900 outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Task Description &amp; Specifications
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-3.5 text-xs text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                  placeholder="Describe requirements, acceptance criteria, or API parameters..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onChange={handleFormChange}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs text-slate-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTask}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-xs disabled:opacity-50"
                >
                  {creatingTask ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Assigning...</span>
                    </>
                  ) : (
                    <span>Create &amp; Assign Task</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List Card */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden space-y-0">
          {/* Card Header with Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 p-5 bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
              <CheckSquare size={16} className="text-indigo-600" />
              <span>
                Total Tasks in View: <strong className="text-slate-900">{tasks.length}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Filter size={14} className="text-slate-400" />
              <label className="text-xs text-slate-500 font-semibold whitespace-nowrap">
                Filter Project:
              </label>
              <select
                value={selectedFilterProjectId}
                onChange={handleFilterProjectChange}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 font-medium outline-none focus:border-indigo-500 cursor-pointer min-w-[200px]"
              >
                <option value="ALL">All Managed Projects</option>
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tasks List */}
          <div className="divide-y divide-slate-100">
            {loadingTasks ? (
              <div className="py-16 text-center">
                <Loader2 className="mx-auto h-7 w-7 animate-spin text-indigo-600 mb-2" />
                <p className="text-xs text-slate-500">Loading tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="py-16 text-center p-6">
                <CheckSquare className="mx-auto text-slate-400 mb-3" size={36} />
                <h3 className="text-base font-bold text-slate-900">
                  No tasks found
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  {selectedFilterProjectId === "ALL"
                    ? "No tasks have been created yet. Click 'Assign Task' above to add tasks for your team."
                    : "No tasks found for this project. Assign a task to start tracking work."}
                </p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task._id}
                  className="p-5 hover:bg-slate-50/50 transition flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">
                        {task.title}
                      </h3>
                      {task.project?.name && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                          <FolderKanban size={11} />
                          {task.project.name}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <UserIcon size={13} className="text-indigo-600" />
                        <span>
                          Assigned to:{" "}
                          <strong className="text-slate-900">
                            {task.assignedTo?.name || "Developer"}
                          </strong>{" "}
                          {task.assignedTo?.role && (
                            <span className="text-indigo-600 font-normal">
                              ({task.assignedTo.role})
                            </span>
                          )}
                        </span>
                      </div>

                      {task.dueDate && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar size={13} className="text-slate-400" />
                          <span>
                            Due:{" "}
                            {new Date(task.dueDate).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>

                    <span
                      className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}