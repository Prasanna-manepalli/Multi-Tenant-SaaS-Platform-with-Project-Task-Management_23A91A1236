const pool = require('../config/db');
const auditLogger = require('../utils/auditLogger');

/**
 * API 16: CREATE TASK
 */
exports.createTask = async (req, res, next) => {
  const { projectId } = req.params;
  const { title, description, assignedTo, priority = 'medium', dueDate } = req.body;
  const { tenantId: userTenantId } = req.user;

  try {
    // Verify project belongs to tenant
    const projectResult = await pool.query(
      `SELECT id, tenant_id FROM projects WHERE id = $1`,
      [projectId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Project does not belong to tenant',
      });
    }

    const projectTenantId = projectResult.rows[0].tenant_id;

    if (projectTenantId !== userTenantId) {
      return res.status(403).json({
        success: false,
        message: 'Project does not belong to tenant',
      });
    }

    // Validate assigned user (if provided)
    if (assignedTo) {
      const userResult = await pool.query(
        `SELECT id FROM users WHERE id = $1 AND tenant_id = $2`,
        [assignedTo, projectTenantId]
      );

      if (userResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user does not belong to tenant',
        });
      }
    }

    const result = await pool.query(
      `
      INSERT INTO tasks (
        project_id, tenant_id, title, description,
        priority, assigned_to, due_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, project_id, tenant_id, title, description,
                status, priority, assigned_to, due_date, created_at
      `,
      [
        projectId,
        projectTenantId,
        title,
        description,
        priority,
        assignedTo || null,
        dueDate || null,
      ]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.rows[0].id,
        projectId: result.rows[0].project_id,
        tenantId: result.rows[0].tenant_id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        status: result.rows[0].status,
        priority: result.rows[0].priority,
        assignedTo: result.rows[0].assigned_to,
        dueDate: result.rows[0].due_date,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 17: LIST PROJECT TASKS
 */
exports.listProjectTasks = async (req, res, next) => {
  const { projectId } = req.params;
  const { tenantId } = req.user;
  const { status, assignedTo, priority, search, page = 1, limit = 50 } = req.query;

  const safeLimit = Math.min(Number(limit), 100);
  const offset = (page - 1) * safeLimit;

  try {
    // Verify project belongs to tenant
    const projectResult = await pool.query(
      `SELECT id FROM projects WHERE id = $1 AND tenant_id = $2`,
      [projectId, tenantId]
    );

    if (projectResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized project access',
      });
    }

    let where = ['t.project_id = $1', 't.tenant_id = $2'];
    let values = [projectId, tenantId];
    let idx = 3;

    if (status) {
      where.push(`t.status = $${idx++}`);
      values.push(status);
    }

    if (assignedTo) {
      where.push(`t.assigned_to = $${idx++}`);
      values.push(assignedTo);
    }

    if (priority) {
      where.push(`t.priority = $${idx++}`);
      values.push(priority);
    }

    if (search) {
      where.push(`t.title ILIKE $${idx++}`);
      values.push(`%${search}%`);
    }

    const tasksResult = await pool.query(
      `
      SELECT
        t.id, t.title, t.description, t.status, t.priority,
        t.due_date, t.created_at,
        u.id AS user_id, u.full_name, u.email
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE ${where.join(' AND ')}
      ORDER BY
        CASE t.priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        t.due_date ASC
      LIMIT $${idx} OFFSET $${idx + 1}
      `,
      [...values, safeLimit, offset]
    );

    const countResult = await pool.query(
      `
      SELECT COUNT(*) FROM tasks t WHERE ${where.join(' AND ')}
      `,
      values
    );

    const total = Number(countResult.rows[0].count);

    res.json({
      success: true,
      data: {
        tasks: tasksResult.rows.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assignedTo: t.user_id
            ? {
                id: t.user_id,
                fullName: t.full_name,
                email: t.email,
              }
            : null,
          dueDate: t.due_date,
          createdAt: t.created_at,
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
 * API 18: UPDATE TASK STATUS
 */
exports.updateTaskStatus = async (req, res, next) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      `
      UPDATE tasks
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND tenant_id = $3
      RETURNING id, status, updated_at
      `,
      [status, taskId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Task not found or unauthorized',
      });
    }

    res.json({
      success: true,
      data: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        updatedAt: result.rows[0].updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * API 19: UPDATE TASK (FULL)
 */
exports.updateTask = async (req, res, next) => {
  const { taskId } = req.params;
  const { title, description, status, priority, assignedTo, dueDate } = req.body;
  const { tenantId, userId } = req.user;

  try {
    // Verify task belongs to tenant
    const taskResult = await pool.query(
      `SELECT id FROM tasks WHERE id = $1 AND tenant_id = $2`,
      [taskId, tenantId]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }

    // Validate assigned user (if provided)
    if (assignedTo !== undefined && assignedTo !== null) {
      const userResult = await pool.query(
        `SELECT id FROM users WHERE id = $1 AND tenant_id = $2`,
        [assignedTo, tenantId]
      );

      if (userResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Assigned user does not belong to tenant',
        });
      }
    }

    const fields = [];
    const values = [];
    let idx = 1;

    if (title) {
      fields.push(`title = $${idx++}`);
      values.push(title);
    }
    if (description) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (status) {
      fields.push(`status = $${idx++}`);
      values.push(status);
    }
    if (priority) {
      fields.push(`priority = $${idx++}`);
      values.push(priority);
    }
    if (assignedTo !== undefined) {
      fields.push(`assigned_to = $${idx++}`);
      values.push(assignedTo);
    }
    if (dueDate !== undefined) {
      fields.push(`due_date = $${idx++}`);
      values.push(dueDate);
    }

    values.push(taskId);

    const result = await pool.query(
      `
      UPDATE tasks
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${idx}
      RETURNING id, title, description, status, priority,
                assigned_to, due_date, updated_at
      `,
      values
    );

    await auditLogger({
      tenantId,
      userId,
      action: 'UPDATE_TASK',
      entityType: 'task',
      entityId: taskId,
    });

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: {
        id: result.rows[0].id,
        title: result.rows[0].title,
        description: result.rows[0].description,
        status: result.rows[0].status,
        priority: result.rows[0].priority,
        assignedTo: result.rows[0].assigned_to,
        dueDate: result.rows[0].due_date,
        updatedAt: result.rows[0].updated_at,
      },
    });
  } catch (err) {
    next(err);
  }
};
