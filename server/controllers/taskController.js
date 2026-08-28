const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

// ==========================================
// CREATE TASK
// ==========================================

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      priority,
      dueDate,
    } = req.body;

    // Check required fields
    if (!title || !project || !assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Title, project and assignedTo are required",
      });
    }

    // Check project exists
    const existingProject = await Project.findById(project);

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check assigned developer exists
    const developer = await User.findById(assignedTo);

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: "Assigned user not found",
      });
    }

    // Create task
    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      assignedBy: req.user._id,
      priority: priority || "Medium",
      dueDate,
      status: "To Do",
    });

    // Ensure developer is in project members
    await Project.findByIdAndUpdate(project, {
      $addToSet: { members: assignedTo },
    });

    // Return detailed task
    const populatedTask = await Task.findById(task._id)
      .populate("project", "name")
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role");

    res.status(201).json({
      success: true,
      message: "Task created and assigned successfully",
      task: populatedTask,
    });

  } catch (error) {
    console.error("Create Task Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create task",
    });
  }
};


// ==========================================
// GET MY TASKS
// ==========================================

const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      assignedTo: req.user._id,
    })
      .populate("project", "name status")
      .populate("assignedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });

  } catch (error) {
    console.error("Get My Tasks Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};


// ==========================================
// GET ALL TASKS (MANAGER / TEAM)
// ==========================================

const getAllTasks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "Project Manager") {
      const managedProjects = await Project.find({ manager: req.user._id }).select("_id");
      const projectIds = managedProjects.map((p) => p._id);
      if (projectIds.length > 0) {
        query = { project: { $in: projectIds } };
      }
    }

    const tasks = await Task.find(query)
      .populate("project", "name status")
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("Get All Tasks Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks",
    });
  }
};

// ==========================================
// GET PROJECT TASKS
// ==========================================

const getProjectTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    console.log("[TASKS] Manager task request received");
    console.log("[TASKS] Project ID:", projectId);

    const tasks = await Task.find({
      project: projectId,
    })
      .populate("project", "name status")
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role")
      .sort({ createdAt: -1 });

    console.log("[TASKS] Tasks found:", tasks.length);
    console.log("[TASKS] Response count:", tasks.length);

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });

  } catch (error) {
    console.error("Get Project Tasks Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch project tasks",
    });
  }
};


// ==========================================
// UPDATE TASK STATUS
// ==========================================

const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "To Do",
      "In Progress",
      "Review",
      "Completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid task status",
      });
    }

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // Only assigned developer can update their task
    if (task.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your assigned tasks",
      });
    }

    task.status = status;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("project", "name")
      .populate("assignedTo", "name email role")
      .populate("assignedBy", "name email role");

    res.status(200).json({
      success: true,
      message: "Task status updated successfully",
      task: updatedTask,
    });

  } catch (error) {
    console.error("Update Task Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update task",
    });
  }
};


module.exports = {
  createTask,
  getMyTasks,
  getAllTasks,
  getProjectTasks,
  updateTaskStatus,
};