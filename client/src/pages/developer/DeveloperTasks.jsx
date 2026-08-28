import { useEffect, useState } from "react";
import { CheckSquare, FolderKanban, Calendar, Loader2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function DeveloperTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    try {
      const response = await api.get("/tasks/my");
      setTasks(response.data.tasks || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const updateStatus = async (taskId, status) => {
    try {
      const response = await api.patch(
        `/tasks/${taskId}/status`,
        { status }
      );

      setTasks((prev) =>
        prev.map((task) =>
          task._id === taskId
            ? response.data.task
            : task
        )
      );

      toast.success("Task status updated");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update task"
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "In Progress":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Review":
        return "bg-violet-50 text-violet-700 border-violet-200";
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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600">
              Developer Workspace
            </p>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              My Assigned Tasks
            </h1>
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            {tasks.length} Assigned Tasks
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Sprint Task Backlog
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Tasks assigned to you by your project manager. Update status as you progress.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs text-slate-500">Loading your tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <CheckSquare className="mx-auto text-slate-300 mb-3" size={36} />
            <h3 className="text-base font-bold text-slate-800">No tasks assigned yet</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Your project manager has not assigned any tasks to your account yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task._id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">
                        {task.title}
                      </h3>
                      {task.project?.name && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md">
                          <FolderKanban size={11} />
                          {task.project.name}
                        </span>
                      )}
                      <span
                        className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getPriorityColor(
                          task.priority
                        )}`}
                      >
                        {task.priority || "Normal"} Priority
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      {task.assignedBy?.name && (
                        <span>Assigned by: <strong className="text-slate-700">{task.assignedBy.name}</strong></span>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          <span>
                            Due: {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-1.5 shrink-0">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Update Task Status
                    </label>
                    <select
                      value={task.status}
                      onChange={(e) => updateStatus(task._id, e.target.value)}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold outline-none cursor-pointer ${getStatusColor(
                        task.status
                      )}`}
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Review">Review</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}