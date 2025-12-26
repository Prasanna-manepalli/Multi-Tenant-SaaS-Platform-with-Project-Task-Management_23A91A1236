import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantSubdomain, setTenantSubdomain] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 🔐 LOGIN API CALL
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password,
        tenantSubdomain,
      });

      console.log("LOGIN RESPONSE:", response.data);

      // ✅ TOKEN EXTRACTION (handles both formats)
      const token =
        response.data?.data?.token ||
        response.data?.token;

      if (!token) {
        throw new Error("Token not received from backend");
      }

      // ✅ STORE TOKEN
      localStorage.setItem("token", token);

      // 🚫 DO NOT CALL /auth/me YET (backend not ready)
      // This avoids login failure

      // ✅ REDIRECT TO DASHBOARD
      navigate("/dashboard");

    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(
        err.response?.data?.message ||
        "Login failed. Check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <br />

        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <br />

        <div>
          <input
            placeholder="Tenant Subdomain"
            value={tenantSubdomain}
            required
            onChange={(e) => setTenantSubdomain(e.target.value)}
          />
        </div>

        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
