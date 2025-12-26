import { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function ProjectModal({ project, onClose, onSaved }) {
  const token = localStorage.getItem("token");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(false);

  // ✅ Sync modal fields when editing project
  useEffect(() => {
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setStatus(project.status || "active");
    } else {
      setName("");
      setDescription("");
      setStatus("active");
    }
  }, [project]);

  const saveProject = async () => {
    if (!name.trim()) {
      alert("Project name is required");
      return;
    }

    setLoading(true);

    try {
      if (project) {
        // ✅ UPDATE PROJECT
        await axios.put(
          `${API}/projects/${project.id}`,
          { name, description, status },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // ✅ CREATE PROJECT
        await axios.post(
          `${API}/projects`,
          { name, description, status },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      onSaved();   // refresh list
      onClose();   // close modal
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message ||
        "Failed to save project (not authorized or server error)";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>{project ? "Edit Project" : "Create Project"}</h3>

        <input
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="completed">Completed</option>
        </select>

        <div style={{ marginTop: "10px" }}>
          <button onClick={saveProject} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button onClick={onClose} style={{ marginLeft: "10px" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    padding: "20px",
    width: "320px",
    borderRadius: "6px",
  },
};
