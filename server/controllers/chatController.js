const ChatMessage = require("../models/ChatMessage");
const Project = require("../models/Project");
const Task = require("../models/Task");

// Helper to verify user belongs to project (as manager, member, or assigned developer)
const userBelongsToProject = async (userId, projectId) => {
  const project = await Project.findById(projectId);
  if (!project) return null;

  if (project.manager.toString() === userId.toString()) return project;
  if (project.members.some((m) => m.toString() === userId.toString())) return project;

  const hasTask = await Task.exists({
    project: projectId,
    assignedTo: userId,
  });

  if (hasTask) return project;
  return null;
};

// GET /api/chat/:projectId
const getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await userBelongsToProject(req.user._id, projectId);

    if (!project) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view messages for this project",
      });
    }

    const messages = await ChatMessage.find({ project: projectId })
      .populate("sender", "name email role")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get Messages Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project chat messages",
    });
  }
};

// POST /api/chat/:projectId
const sendProjectMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content cannot be empty",
      });
    }

    const project = await userBelongsToProject(req.user._id, projectId);
    if (!project) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to send messages in this project",
      });
    }

    const newMsg = await ChatMessage.create({
      project: projectId,
      sender: req.user._id,
      message: message.trim(),
    });

    const populated = await ChatMessage.findById(newMsg._id).populate(
      "sender",
      "name email role"
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      chatMessage: populated,
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

module.exports = {
  getProjectMessages,
  sendProjectMessage,
};
