import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import UserModal from "../components/UserModal";

const API = "http://localhost:5000/api";

export default function Users() {
  const { user, token, loading } = useAuth();

  // ✅ 1. Wait for auth to finish
  if (loading) {
    return <p style={{ padding: "20px" }}>Loading...</p>;
  }

  // ✅ 2. User must exist
  if (!user) {
    return <p style={{ padding: "20px" }}>Not authenticated</p>;
  }

  // ✅ 3. Role check AFTER user exists
  if (user.role !== "tenant_admin") {
    return <p style={{ padding: "20px" }}>Access denied</p>;
  }

  const tenantId = user.tenant.id;

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(
        `${API}/tenants/${tenantId}/users`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setUsers(res.data.data.users || []);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await axios.delete(`${API}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    fetchUsers();
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter ? u.role === roleFilter : true;

    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>Users</h2>

      <button onClick={() => {
        setEditingUser(null);
        setShowModal(true);
      }}>
        Add User
      </button>

      <div style={{ margin: "10px 0" }}>
        <input
          placeholder="Search name or email"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          <option value="user">User</option>
          <option value="tenant_admin">Tenant Admin</option>
        </select>
      </div>

      {filteredUsers.length === 0 && <p>No users found.</p>}

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(u => (
            <tr key={u.id}>
              <td>{u.fullName}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.isActive ? "Active" : "Inactive"}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => {
                  setEditingUser(u);
                  setShowModal(true);
                }}>
                  Edit
                </button>
                <button onClick={() => deleteUser(u.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <UserModal
          tenantId={tenantId}
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSaved={fetchUsers}
        />
      )}
    </div>
  );
}
