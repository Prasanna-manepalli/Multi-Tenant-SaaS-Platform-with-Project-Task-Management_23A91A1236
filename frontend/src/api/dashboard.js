const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchProjects(token) {
  const res = await fetch(`${API_URL}/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function fetchProjectTasks(projectId, token) {
  const res = await fetch(`${API_URL}/projects/${projectId}/tasks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
