const pool = require('../config/db');
const { hashPassword } = require('../utils/password');
const auditLogger = require('../utils/auditLogger');

/**
 * API 8: ADD USER TO TENANT
 */
exports.addUser = async (req, res, next) => {
  const { tenantId } = req.params;
  const { role: currentRole, userId: currentUserId, tenantId: currentTenantId } = req.user;
  const { email, password, fullName, role = 'user' } = req.body;

  try {
    if (currentRole !== 'tenant_admin' || tenantId !== currentTenantId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Subscription limit check
    const tenantResult = await pool.query(
      `SELECT max_users FROM tenants WHERE id = $1`,
      [tenantId]
    );
    const maxUsers = tenantResult.rows[0].max_users;

    const userCountResult = await pool.query(
      `SELECT COUNT(*) FROM users WHERE tenant_id = $1`,
      [tenantId]
    );
    if (Number(userCountResult.rows[0].count) >= maxUsers) {
      return res.status(403).json({ success: false, message: 'User limit reached' });
    }

    // Email uniqueness per tenant
    const existingUser = await pool.query(
      `SELECT id FROM users WHERE tenant_id = $1 AND email = $2`,
      [tenantId, email]
    );
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      `
      INSERT INTO users (tenant_id, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, full_name, role, tenant_id, is_active, created_at
      `,
      [tenantId, email, passwordHash, fullName, role]
    );

    await auditLogger({
      tenantId,
      userId: currentUserId,
      action: 'CREATE_USER',
      entityType: 'user',
      entityId: result.rows[0].id,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        fullName: result.rows[0].full_name,
        role: result.rows[0].role,
        tenantId: result.rows[0].tenant_id,
        isActive: result.rows[0].is_active,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 9: LIST TENANT USERS
 */
exports.listUsers = async (req, res, next) => {
  const { tenantId } = req.params;
  const { tenantId: currentTenantId } = req.user;
  const { search, role, page = 1, limit = 50 } = req.query;

  if (tenantId !== currentTenantId) {
    return res.status(403).json({ success: false, message: 'Unauthorized' });
  }

  const offset = (page - 1) * Math.min(limit, 100);

  try {
    let where = ['tenant_id = $1'];
    let values = [tenantId];
    let idx = 2;

    if (search) {
      where.push(`(email ILIKE $${idx} OR full_name ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    if (role) {
      where.push(`role = $${idx}`);
      values.push(role);
      idx++;
    }

    const usersResult = await pool.query(
      `
      SELECT id, email, full_name, role, is_active, created_at
      FROM users
      WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...values, limit, offset]
    );

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users WHERE ${where.join(' AND ')}`,
      values
    );

    res.json({
      success: true,
      data: {
        users: usersResult.rows.map(u => ({
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          role: u.role,
          isActive: u.is_active,
          createdAt: u.created_at,
        })),
        total: Number(countResult.rows[0].count),
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(countResult.rows[0].count / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 10: UPDATE USER
 */
exports.updateUser = async (req, res, next) => {
  const { userId } = req.params;
  const { userId: currentUserId, tenantId, role: currentRole } = req.user;
  const { fullName, role, isActive } = req.body;

  try {
    const userResult = await pool.query(
      `SELECT id, tenant_id FROM users WHERE id = $1`,
      [userId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (userResult.rows[0].tenant_id !== tenantId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (currentRole !== 'tenant_admin' && userId !== currentUserId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (currentRole !== 'tenant_admin' && (role || isActive !== undefined)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (fullName) {
      fields.push(`full_name = $${idx++}`);
      values.push(fullName);
    }
    if (currentRole === 'tenant_admin' && role) {
      fields.push(`role = $${idx++}`);
      values.push(role);
    }
    if (currentRole === 'tenant_admin' && isActive !== undefined) {
      fields.push(`is_active = $${idx++}`);
      values.push(isActive);
    }

    values.push(userId);

    const result = await pool.query(
      `
      UPDATE users
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${idx}
      RETURNING id, full_name, role, updated_at
      `,
      values
    );

    await auditLogger({
      tenantId,
      userId: currentUserId,
      action: 'UPDATE_USER',
      entityType: 'user',
      entityId: userId,
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 11: DELETE USER
 */
exports.deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  const { userId: currentUserId, tenantId, role } = req.user;

  try {
    if (role !== 'tenant_admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (userId === currentUserId) {
      return res.status(403).json({ success: false, message: 'Cannot delete self' });
    }

    const userResult = await pool.query(
      `SELECT id FROM users WHERE id = $1 AND tenant_id = $2`,
      [userId, tenantId]
    );
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await pool.query(
      `UPDATE tasks SET assigned_to = NULL WHERE assigned_to = $1`,
      [userId]
    );

    await pool.query(
      `DELETE FROM users WHERE id = $1`,
      [userId]
    );

    await auditLogger({
      tenantId,
      userId: currentUserId,
      action: 'DELETE_USER',
      entityType: 'user',
      entityId: userId,
    });

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};
