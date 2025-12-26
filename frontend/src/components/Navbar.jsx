import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav style={styles.nav}>
      <h3>Multi-Tenant SaaS</h3>

      <div style={styles.links}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/projects">Projects</Link>
        <Link to="/tasks">Tasks</Link>
        <Link to="/users">Users</Link>
        <Link to="/tenants">Tenants</Link>
      </div>

      <button onClick={() => navigate("/login")}>Logout</button>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "#ddd",
  },
  links: {
    display: "flex",
    gap: "15px",
  },
};
