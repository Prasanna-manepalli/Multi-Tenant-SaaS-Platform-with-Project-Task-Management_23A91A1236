import express from "express";

const router = express.Router();

// 🧠 Temporary in-memory storage
let tasks = [];

/**
 * GET /api/tasks
 * List tasks (optionally by assigned user)
 */
router.get("/", (req, res) => {
  const { assignedTo } = req.query;

  let result = tasks;

  if (assignedTo) {
    result = tasks.filter(t => t.assignedTo === assignedTo);
  }

  res.json({
    success: true,
    data: result,
  });
});

/**
 * POST /api/projects/:projectId/tasks
 * Create task
 */
router.post("/projects/:projectId/tasks", (req, res) => {
  const { title, description, assignedTo, priority, dueDate } = req.body;
  const { projectId } = req.params;

  if (!title) {
    return res.status(400).json({
      success: false,
      message: "Task title is required",
    });
  }

  const newTask = {
    id: Date.now().toString(),
    projectId,
    title,
    description,
    status: "todo",
    priority: priority || "medium",
    assignedTo: assignedTo || null,
    dueDate: dueDate || null,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);

  res.status(201).json({
    success: true,
    data: newTask,
  });
});

export default router;
