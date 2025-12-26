import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

/* =========================
   LOGIN (TEMP – NO DB)
========================= */
router.post("/login", (req, res) => {
  const { email, tenantSubdomain } = req.body;

  // simple validation
  if (!email || !tenantSubdomain) {
    return res.status(400).json({
      success: false,
      message: "Missing fields",
    });
  }

  // 🔐 Generate JWT (temporary user)
  const token = jwt.sign(
    {
      userId: "demo-user-id",
      tenantId: "demo-tenant-id",
      role: "tenant_admin",
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  return res.status(200).json({
    success: true,
    data: {
      token,
    },
  });
});

/* =========================
   REGISTER TENANT (TEMP)
========================= */
router.post("/register-tenant", (req, res) => {
  res.status(201).json({
    success: true,
    message: "Tenant registered (mock)",
  });
});

export default router;
