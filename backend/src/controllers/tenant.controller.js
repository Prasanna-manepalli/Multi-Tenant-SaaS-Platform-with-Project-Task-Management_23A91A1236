const pool = require('../config/db');
const auditLogger = require('../utils/auditLogger');

/**
 * API 5: GET TENANT DETAILS
 */
exports.getTenantDetails = async (req, res, next) => {
  const { tenantId } = req.params;
  const { tenantId: userTenantId, role } = req.user;

  try {
    // Authorization check
    if (role !== 'super_admin' && tenantId !== userTenantId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const tenantResult = await pool.query(
      `SELECT id, name, subdomain, status, subscription_plan,
              max_users, max_projects, created_at
       FROM tenants
       WHERE id = $1`,
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    const statsResult = await pool.query(
      `
      SELECT
        (SELECT COUNT(*) FROM users WHERE tenant_id = $1) AS total_users,
        (SELECT COUNT(*) FROM projects WHERE tenant_id = $1) AS total_projects,
        (SELECT COUNT(*) FROM tasks WHERE tenant_id = $1) AS total_tasks
      `,
      [tenantId]
    );

    const t = tenantResult.rows[0];
    const stats = statsResult.rows[0];

    res.json({
      success: true,
      data: {
        id: t.id,
        name: t.name,
        subdomain: t.subdomain,
        status: t.status,
        subscriptionPlan: t.subscription_plan,
        maxUsers: t.max_users,
        maxProjects: t.max_projects,
        createdAt: t.created_at,
        stats: {
          totalUsers: Number(stats.total_users),
          totalProjects: Number(stats.total_projects),
          totalTasks: Number(stats.total_tasks),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 6: UPDATE TENANT
 */
exports.updateTenant = async (req, res, next) => {
  const { tenantId } = req.params;
  const { role, userId } = req.user;
  const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;

  try {
    // Tenant admin restrictions
    if (role === 'tenant_admin') {
      if (status || subscriptionPlan || maxUsers || maxProjects) {
        return res.status(403).json({
          success: false,
          message: 'Tenant admin cannot update subscription or status fields',
        });
      }
    }

    const fields = [];
    const values = [];
    let index = 1;

    if (name) {
      fields.push(`name = $${index++}`);
      values.push(name);
    }
    if (role === 'super_admin' && status) {
      fields.push(`status = $${index++}`);
      values.push(status);
    }
    if (role === 'super_admin' && subscriptionPlan) {
      fields.push(`subscription_plan = $${index++}`);
      values.push(subscriptionPlan);
    }
    if (role === 'super_admin' && maxUsers) {
      fields.push(`max_users = $${index++}`);
      values.push(maxUsers);
    }
    if (role === 'super_admin' && maxProjects) {
      fields.push(`max_projects = $${index++}`);
      values.push(maxProjects);
    }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    values.push(tenantId);

    const result = await pool.query(
      `
      UPDATE tenants
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${index}
      RETURNING id, name, updated_at
      `,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tenant not found' });
    }

    // Audit log
    await auditLogger({
      tenantId,
      userId,
      action: 'UPDATE_TENANT',
      entityType: 'tenant',
      entityId: tenantId,
    });

    res.json({
      success: true,
      message: 'Tenant updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 7: LIST ALL TENANTS (SUPER ADMIN ONLY)
 */
exports.listTenants = async (req, res, next) => {
  const { role } = req.user;

  if (role !== 'super_admin') {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const offset = (page - 1) * limit;
  const { status, subscriptionPlan } = req.query;

  try {
    let where = [];
    let values = [];
    let idx = 1;

    if (status) {
      where.push(`t.status = $${idx++}`);
      values.push(status);
    }
    if (subscriptionPlan) {
      where.push(`t.subscription_plan = $${idx++}`);
      values.push(subscriptionPlan);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const tenantsResult = await pool.query(
      `
      SELECT t.id, t.name, t.subdomain, t.status, t.subscription_plan,
             t.created_at,
             (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.id) AS total_users,
             (SELECT COUNT(*) FROM projects p WHERE p.tenant_id = t.id) AS total_projects
      FROM tenants t
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...values, limit, offset]
    );

    const countResult = await pool.query(
      `
      SELECT COUNT(*) FROM tenants t ${whereClause}
      `,
      values
    );

    const totalTenants = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(totalTenants / limit);

    res.json({
      success: true,
      data: {
        tenants: tenantsResult.rows.map(t => ({
          id: t.id,
          name: t.name,
          subdomain: t.subdomain,
          status: t.status,
          subscriptionPlan: t.subscription_plan,
          totalUsers: Number(t.total_users),
          totalProjects: Number(t.total_projects),
          createdAt: t.created_at,
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalTenants,
          limit,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};
