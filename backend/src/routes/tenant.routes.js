import express from "express";
const router = express.Router();

router.get("/:tenantId", (req, res) => {
  res.json({ success: true, message: "Get tenant details" });
});

export default router;
