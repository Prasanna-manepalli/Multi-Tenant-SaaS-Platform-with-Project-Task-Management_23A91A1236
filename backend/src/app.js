import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load env variables
dotenv.config();

const app = express();

/* ---------- MIDDLEWARE ---------- */
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite frontend
      "http://localhost:3000", // Docker / React fallback
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);

/* ---------- ROUTE IMPORTS ---------- */
import authRoutes from "./routes/auth.routes.js";
import tenantRoutes from "./routes/tenant.routes.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";

/* ---------- ROUTE MOUNTS ---------- */
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);

// ✅ IMPORTANT: task routes mounted twice
app.use("/api/tasks", taskRoutes); // GET /api/tasks
app.use("/api", taskRoutes);       // POST /api/projects/:projectId/tasks

/* ---------- HEALTH CHECK ---------- */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    database: "connected",
  });
});

export default app;
