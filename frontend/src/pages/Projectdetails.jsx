import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import TaskModal from "../components/TaskModal";

const API = "http://localhost:5000/api";

export default function ProjectDetails() {
  const { projectId } = useParams();
  const location = useLocation();
  const token = localStorage.getItem("token");

  // ✅ GET PROJECT FROM ROUTE STATE
  const [project, setProject] = useState(
    location.state?.project || null
  );

  const [tasks, setTasks] = useState([]);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    if (!token || !projectId) return;
    fetchTasks();
  }, [token, projectId]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(
        `${API}/projects/${projectId}/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setTasks(res.data.data || []);
    } catch (err) {
      console.error("Fetch tasks failed", err);
    }
  };

  if (!project) {
    return <p>Project not found (navigation state missing)</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>{project.name}</h2>
      <p>Status: {project.status}</p>
      <p>{project.description}</p>

      <h3>Tasks</h3>

      <button onClick={() => setShowTaskModal(true)}>
        Add Task
      </button>

      {tasks.length === 0 && <p>No tasks yet</p>}

      {tasks.map((task) => (
        <div key={task.id} style={styles.task}>
          <strong>{task.title}</strong>
          <p>Status: {task.status}</p>
          <p>Priority: {task.priority}</p>
        </div>
      ))}

      {showTaskModal && (
        <TaskModal
          projectId={projectId}
          token={token}
          onClose={() => setShowTaskModal(false)}
          onSaved={fetchTasks}
        />
      )}
    </div>
  );
}

const styles = {
  task: {
    border: "1px solid #ccc",
    padding: "10px",
    marginBottom: "10px",
  },
};
