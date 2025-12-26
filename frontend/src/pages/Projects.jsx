import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ProjectModal from "../components/ProjectModal";

const API = "http://localhost:5000/api";

export default function Projects() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => {
    if (token) fetchProjects();
  }, [token]);

  const fetchProjects = async () => {
    const res = await axios.get(`${API}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setProjects(res.data.data || []);
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;

    await axios.delete(`${API}/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchProjects();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Projects</h2>

      <button
        onClick={() => {
          setEditingProject(null);
          setShowModal(true);
        }}
      >
        Create New Project
      </button>

      {projects.length === 0 && <p>No projects found.</p>}

      {projects.map((project) => (
        <div key={project.id} style={styles.card}>
          <h3>{project.name}</h3>
          <p>{project.description}</p>
          <p>Status: {project.status}</p>

          {/* ✅ FIXED VIEW BUTTON */}
          <button
            onClick={() =>
              navigate(`/projects/${project.id}`, {
                state: { project }, // ✅ PASS PROJECT
              })
            }
          >
            View
          </button>

          <button
            onClick={() => {
              setEditingProject(project);
              setShowModal(true);
            }}
          >
            Edit
          </button>

          <button onClick={() => deleteProject(project.id)}>
            Delete
          </button>
        </div>
      ))}

      {showModal && (
        <ProjectModal
          project={editingProject}
          onClose={() => setShowModal(false)}
          onSaved={fetchProjects}
        />
      )}
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ccc",
    padding: "10px",
    marginBottom: "10px",
  },
};
