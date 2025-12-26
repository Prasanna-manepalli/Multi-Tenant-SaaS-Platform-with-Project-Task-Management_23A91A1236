import express from "express";

const router = express.Router();

// 🧠 In-memory storage (temporary)
let projects = [];

/**
 * GET /api/projects
 * List projects
 */
router.get("/", (req, res) => {
  res.json({
    success: true,
    data: projects,
  });
});

/**
 * GET /api/projects/:id
 * View project details
 */
router.get("/:id", (req, res) => {
  const project = projects.find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  res.json({
    success: true,
    data: project,
  });
});

/**
 * POST /api/projects
 * Create project
 */
router.post("/", (req, res) => {
  const { name, description, status } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Project name is required",
    });
  }

  const newProject = {
    id: Date.now().toString(),
    name,
    description,
    status: status || "active",
    createdAt: new Date().toISOString(),
  };

  projects.push(newProject);

  res.status(201).json({
    success: true,
    data: newProject,
  });
});

/**
 * PUT /api/projects/:id
 * Update project
 */
router.put("/:id", (req, res) => {
  const { name, description, status } = req.body;
  const project = projects.find(p => p.id === req.params.id);

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  project.name = name ?? project.name;
  project.description = description ?? project.description;
  project.status = status ?? project.status;

  res.json({
    success: true,
    message: "Project updated successfully",
    data: project,
  });
});

/**
 * DELETE /api/projects/:id
 * Delete project
 */
router.delete("/:id", (req, res) => {
  const index = projects.findIndex(p => p.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  projects.splice(index, 1);

  res.json({
    success: true,
    message: "Project deleted successfully",
  });
});

export default router;
