const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes");
const userRoutes = require("./routes/userRoutes");
const codeRoutes = require("./routes/codeRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

// ================= MIDDLEWARE =================

app.use(cors({ origin: "https://devflow-ai-iota.vercel.app" }));
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// ================= ROUTES =================

app.use("/api/test", testRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/users", userRoutes);
app.use("/api/code", codeRoutes);
app.use("/api/code-submissions", codeRoutes);
app.use("/api/chat", chatRoutes);

// ================= HEALTH CHECK =================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    project: "DevFlow AI",
    message: "Backend is running successfully 🚀",
  });
});

module.exports = app;
