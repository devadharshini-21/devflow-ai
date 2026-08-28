import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Loader2, FolderKanban } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../services/api";

export default function DeveloperChat() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || "Frontend Developer";

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch Projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        const list = res.data.projects || [];
        setProjects(list);
        if (list.length > 0) {
          setSelectedProjectId(list[0]._id);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  // Fetch Messages for Selected Project
  const fetchMessages = async (projectId, isPolling = false) => {
    if (!projectId) return;
    if (!isPolling) setLoadingMessages(true);
    try {
      const res = await api.get(`/chat/${projectId}`);
      setMessages(res.data.messages || []);
    } catch (err) {
      if (!isPolling) {
        console.error("Failed to fetch messages:", err);
        toast.error("Failed to load chat messages");
      }
    } finally {
      if (!isPolling) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      fetchMessages(selectedProjectId);
      const interval = setInterval(() => {
        fetchMessages(selectedProjectId, true);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedProjectId) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      const res = await api.post(`/chat/${selectedProjectId}`, {
        message: textToSend,
      });

      setMessages((prev) => [...prev, res.data.chatMessage]);
    } catch (err) {
      console.error("Send message error:", err);
      toast.error(err.response?.data?.message || "Failed to send message");
      setInputText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  return (
    <div className="flex h-screen flex-col bg-[#F8FAFC] text-slate-900 page-enter">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-8">
        <div>
          <p className="text-xs uppercase tracking-wider font-semibold text-indigo-600">
            {role} Workspace
          </p>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Team Group Chat
          </h1>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2.5">
          <label className="text-xs text-slate-500 font-semibold">Project Channel:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={loadingProjects}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-900 outline-none transition focus:border-indigo-500 cursor-pointer"
          >
            {loadingProjects ? (
              <option>Loading channels...</option>
            ) : projects.length === 0 ? (
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
      </header>

      {/* Main Chat Area */}
      <main className="flex flex-1 overflow-hidden p-6">
        <div className="mx-auto flex h-full w-full max-w-5xl flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Channel Info Bar */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-3 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <FolderKanban size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  {selectedProject?.name || "Select a project channel"}
                </h3>
                <p className="text-[10px] text-slate-500">
                  {selectedProject?.technologyStack?.join(", ") || "Project Channel"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-emerald-700 font-semibold">Channel Online</span>
            </div>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAFAFA]">
            {loadingMessages ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600" size={24} />
              </div>
            ) : !selectedProjectId ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                <FolderKanban size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No project selected</p>
                <p className="text-[11px]">Select a project channel to start communicating with your team.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                <MessageSquare size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-semibold text-slate-600">No messages in this channel yet</p>
                <p className="text-[11px]">Post an update or question to your teammates.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender?._id === user.id || msg.sender?._id === user._id || msg.sender === user.id;

                return (
                  <div
                    key={msg._id}
                    className={`flex items-start gap-2.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                        isMe
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {(msg.sender?.name || "U")[0].toUpperCase()}
                    </div>

                    {/* Message Bubble */}
                    <div className={`max-w-md space-y-1 ${isMe ? "text-right" : "text-left"}`}>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <span className="font-semibold text-slate-700">
                          {isMe ? "You" : msg.sender?.name || "Team Member"}
                        </span>
                        {msg.sender?.role && (
                          <span className="rounded bg-slate-100 px-1 py-0.2 text-[9px] font-medium text-slate-600">
                            {msg.sender.role}
                          </span>
                        )}
                        <span>&bull;</span>
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div
                        className={`inline-block rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                          isMe
                            ? "bg-indigo-600 text-white rounded-tr-none shadow-xs"
                            : "bg-white text-slate-900 rounded-tl-none border border-slate-200 shadow-xs"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={handleSendMessage}
            className="flex shrink-0 items-center gap-3 border-t border-slate-200 p-4 bg-white"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={selectedProjectId ? "Type a message to the channel..." : "Select a project to chat..."}
              disabled={!selectedProjectId || sending}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!selectedProjectId || !inputText.trim() || sending}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40 shadow-xs"
            >
              {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}