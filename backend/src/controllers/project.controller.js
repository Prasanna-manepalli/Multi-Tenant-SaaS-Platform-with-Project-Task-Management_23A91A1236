const pool = require('../config/db');
const auditLogger = require('../utils/auditLogger');

/**
 * API 12: CREATE PROJECT
 */
exports.createProject = async (req, res, next) => {
  const { name, description, status = 'active' } = req.body;
  const { tenantId, userId } = req.user;

  try {
    // Check project limit
    const tenantResult = await pool.query(
      `SELECT max_projects FROM tenants WHERE id = $1`,
      [tenantId]
    );
    const maxProjects = tenantResult.rows[0].max_projects;

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM projects WHERE tenant_id = $1`,
      [tenantId]
    );

    if (Number(countResult.rows[0].count) >= maxProjects) {
      return res.status(403).json({
        success: false,
        message: 'Project limit reached',
      });
    }

    const result = await pool.query(
      `
      INSERT INTO projects (tenant_id, name, description, status, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, tenant_id, name, description, status, created_by, created_at
      `,
      [tenantId, name, description, status, userId]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        tenantId: result.rows[0].tenant_id,
        name: result.rows[0].name,
        description: result.rows[0].description,
        status: result.rows[0].status,
        createdBy: result.rows[0].created_by,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 13: LIST PROJECTS
 */
exports.listProjects = async (req, res, next) => {
  const { tenantId } = req.user;
  const { status, search, page = 1, limit = 20 } = req.query;

  const safeLimit = Math.min(Number(limit), 100);
  const offset = (page - 1) * safeLimit;

  try {
    let where = ['p.tenant_id = $1'];
    let values = [tenantId];
    let idx = 2;

    if (status) {
      where.push(`p.status = $${idx++}`);
      values.push(status);
    }

    if (search) {
      where.push(`p.name ILIKE $${idx++}`);
      values.push(`%${search}%`);
    }

    const projectsResult = await pool.query(
      `
      SELECT
        p.id, p.name, p.description, p.status, p.created_at,
        u.id AS creator_id, u.full_name AS creator_name,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id) AS task_count,
        (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.status = 'completed') AS completed_task_count
      FROM projects p
      JOIN users u ON p.created_by = u.id
      WHERE ${where.join(' AND ')}
      ORDER BY p.created_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...values, safeLimit, offset]
    );

    const countResult = await pool.query(
      `
      SELECT COUNT(*) FROM projects p WHERE ${where.join(' AND ')}
      `,
      values
    );

    const total = Number(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        projects: projectsResult.rows.map(p => ({
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          createdBy: {
            id: p.creator_id,
            fullName: p.creator_name,
          },
          taskCount: Number(p.task_count),
          completedTaskCount: Number(p.completed_task_count),
          createdAt: p.created_at,
        })),
        total,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / safeLimit),
          limit: safeLimit,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 14: UPDATE PROJECT
 */
exports.updateProject = async (req, res, next) => {
  const { projectId } = req.params;
  const { name, description, status } = req.body;
  const { tenantId, userId, role } = req.user;

  try {
    const projectResult = await pool.query(
      `
      SELECT id, created_by FROM projects
      WHERE id = $1 AND tenant_id = $2
      `,
      [projectId, tenantId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const project = projectResult.rows[0];

    if (role !== 'tenant_admin' && project.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (name) {
      fields.push(`name = $${idx++}`);
      values.push(name);
    }
    if (description) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (status) {
      fields.push(`status = $${idx++}`);
      values.push(status);
    }

    values.push(projectId);

    const result = await pool.query(
      `
      UPDATE projects
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${idx}
      RETURNING id, name, description, status, updated_at
      `,
      values
    );

    await auditLogger({
      tenantId,
      userId,
      action: 'UPDATE_PROJECT',
      entityType: 'project',
      entityId: projectId,
    });

    res.json({
      success: true,
      message: 'Project updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 15: DELETE PROJECT
 */
exports.deleteProject = async (req, res, next) => {
  const { projectId } = req.params;
  const { tenantId, userId, role } = req.user;

  try {
    const projectResult = await pool.query(
      `
      SELECT id, created_by FROM projects
      WHERE id = $1 AND tenant_id = $2
      `,
      [projectId, tenantId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
      });
    }

    const project = projectResult.rows[0];

    if (role !== 'tenant_admin' && project.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // CASCADE delete will remove tasks automatically
    await pool.query(`DELETE FROM projects WHERE id = $1`, [projectId]);

    await auditLogger({
      tenantId,
      userId,
      action: 'DELETE_PROJECT',
      entityType: 'project',
      entityId: projectId,
    });

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};
