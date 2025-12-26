import { useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

export default function TaskModal({ projectId, token, onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const saveTask = async () => {
    if (!title.trim()) {
      alert("Task title required");
      return;
    }

    await axios.post(
      `${API}/projects/${projectId}/tasks`,
      { title, description, priority },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    onSaved();
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>Add Task</h3>

        <input
          placeholder="Task title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <div>
          <button onClick={saveTask}>Save</button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)"
  },
  modal: {
    background: "#fff",
    padding: "20px",
    margin: "100px auto",
    width: "300px"
  }
};
