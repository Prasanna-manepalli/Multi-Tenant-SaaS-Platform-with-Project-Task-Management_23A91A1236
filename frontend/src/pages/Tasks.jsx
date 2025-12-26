import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000/api";

export default function Tasks() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const res = await axios.get(`${API}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setTasks(res.data.data.tasks || []);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Tasks</h2>

      {tasks.length === 0 && <p>No tasks assigned to you</p>}

      {tasks.map(task => (
        <div key={task.id} style={styles.card}>
          <strong>{task.title}</strong>
          <p>Project: {task.Project?.name}</p>
          <p>Status: {task.status}</p>
          <p>Priority: {task.priority}</p>
        </div>
      ))}
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ccc",
    padding: "10px",
    marginBottom: "10px"
  }
};
