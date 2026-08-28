import { useEffect, useState } from "react";
import { FolderKanban, Loader2, Calendar } from "lucide-react";
import api from "../../services/api";

export default function DeveloperProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await api.get("/tasks/my");
        const tasks = response.data.tasks || [];

        const uniqueProjects = [];
        tasks.forEach((task) => {
          if (
            task.project &&
            !uniqueProjects.some(
              (project) =>
                project._id === task.project._id
            )
          ) {
            uniqueProjects.push(task.project);
          }
        });

        setProjects(uniqueProjects);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

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
              My Projects
            </h1>
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            {projects.length} Active Projects
          </div>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Assigned Workspaces
          </h2>
          <p className="text-xs text-slate-500 max-w-xl">
            Projects where you currently have assigned tasks or submitted code.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs text-slate-500">Loading projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <FolderKanban className="mx-auto text-slate-300 mb-3" size={36} />
            <h3 className="text-base font-bold text-slate-800">No projects found</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              When tasks are assigned to you in a project, it will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <div
                key={project._id}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <FolderKanban size={18} />
                  </div>
                  <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700">
                    {project.status || "Active"}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>

                {project.technologyStack?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {project.technologyStack.map((tech, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}