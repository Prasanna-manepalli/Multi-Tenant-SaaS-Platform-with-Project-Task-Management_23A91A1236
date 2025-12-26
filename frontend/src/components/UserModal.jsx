import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = "http://localhost:5000/api";

export default function UserModal({ tenantId, user, onClose, onSaved }) {
  const { token } = useAuth();

  const [email, setEmail] = useState(user?.email || "");
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user?.role || "user");
  const [isActive, setIsActive] = useState(user?.isActive ?? true);

  const saveUser = async () => {
    if (!email || !fullName) {
      alert("Email and full name required");
      return;
    }

    if (!user && !password) {
      alert("Password required for new user");
      return;
    }

    if (user) {
      await axios.put(
        `${API}/users/${user.id}`,
        { fullName, role, isActive },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } else {
      await axios.post(
        `${API}/tenants/${tenantId}/users`,
        { email, fullName, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    onSaved();
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>{user ? "Edit User" : "Add User"}</h3>

        <input
          placeholder="Email"
          value={email}
          disabled={!!user}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          placeholder="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
        />

        {!user && (
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
        )}

        <select value={role} onChange={e => setRole(e.target.value)}>
          <option value="user">User</option>
          <option value="tenant_admin">Tenant Admin</option>
        </select>

        {user && (
          <label>
            <input
              type="checkbox"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
            />
            Active
          </label>
        )}

        <div>
          <button onClick={saveUser}>Save</button>
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
    width: "300px",
    margin: "100px auto"
  }
};
