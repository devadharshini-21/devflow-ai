const Project = require("../models/Project");
const Task = require("../models/Task");

const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      members,
      technologyStack,
      deadline,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const project = await Project.create({
      name,
      description,
      manager: req.user._id,
      members: members || [],
      technologyStack: technologyStack || [],
      deadline,
      status: "Planning",
    });

    const populatedProject = await Project.findById(project._id)
      .populate("manager", "name email role")
      .populate("members", "name email role");

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: populatedProject,
    });
  } catch (error) {
    console.error("Create Project Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};


const getMyProjects = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all projects where the user is assigned any tasks
    const taskProjectIds = await Task.distinct("project", {
      assignedTo: userId,
    });

    const projects = await Project.find({
      $or: [
        { manager: userId },
        { members: userId },
        { _id: { $in: taskProjectIds } },
      ],
    })
      .populate("manager", "name email role")
      .populate("members", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get Projects Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};


module.exports = {
  createProject,
  getMyProjects,
};