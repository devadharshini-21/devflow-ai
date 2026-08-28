const User = require("../models/User");

// Get all developers/team members
const getTeamMembers = async (req, res) => {
  try {
    const users = await User.find({
      role: {
        $in: [
          "Frontend Developer",
          "Backend Developer",
          "UI/UX Designer",
          "QA Tester",
        ],
      },
    }).select("_id name email role");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get Team Members Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch team members",
    });
  }
};

module.exports = {
  getTeamMembers,
};