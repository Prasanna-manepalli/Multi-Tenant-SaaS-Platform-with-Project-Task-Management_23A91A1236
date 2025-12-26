import { useState } from "react";
import { registerTenant } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    const res = await registerTenant(form);
    if (res.success) {
      setMsg("Registered successfully");
      setTimeout(() => navigate("/login"), 1500);
    } else {
      setMsg(res.message || "Error");
    }
  };

  return (
    <form onSubmit={submit}>
      <h2>Register Tenant</h2>
      <input name="tenantName" placeholder="Organization Name" onChange={handleChange} required />
      <input name="subdomain" placeholder="Subdomain" onChange={handleChange} required />
      <input name="adminEmail" placeholder="Admin Email" onChange={handleChange} required />
      <input name="adminFullName" placeholder="Admin Full Name" onChange={handleChange} required />
      <input type="password" name="adminPassword" placeholder="Password" onChange={handleChange} required />
      <button type="submit">Register</button>
      <p>{msg}</p>
      <Link to="/login">Login</Link>
    </form>
  );
}
