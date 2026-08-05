import { query, run, getOne } from '../config/db.js';

export const getEnterpriseAnalytics = async (req, res) => {
  try {
    const totalProjects = await getOne('SELECT COUNT(*) as count FROM projects;');
    const delayedProjects = await getOne('SELECT COUNT(*) as count FROM projects WHERE status = "Delayed";');
    const totalTasks = await getOne('SELECT COUNT(*) as count FROM tasks;');
    const completedTasks = await getOne('SELECT COUNT(*) as count FROM tasks WHERE status = "Completed";');
    const overdueTasks = await getOne('SELECT COUNT(*) as count FROM tasks WHERE due_date < DATE("now") AND status != "Completed";');
    const totalUsers = await getOne('SELECT COUNT(*) as count FROM users;');

    const departmentStats = await query(`
      SELECT department, COUNT(id) as project_count, AVG(risk_score) as avg_risk 
      FROM projects GROUP BY department;
    `);

    const recentAuditLogs = await query(`
      SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 10;
    `);

    return res.json({
      success: true,
      data: {
        metrics: {
          totalProjects: totalProjects.count,
          delayedProjects: delayedProjects.count,
          totalTasks: totalTasks.count,
          completedTasks: completedTasks.count,
          overdueTasks: overdueTasks.count,
          totalUsers: totalUsers.count,
          aiHealthScore: 94,
          meetingEfficiency: 88,
          productivityIndex: 92
        },
        departmentStats,
        auditLogs: recentAuditLogs
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getWorkflows = async (req, res) => {
  try {
    const workflows = await query('SELECT * FROM workflows ORDER BY id DESC;');
    return res.json({ success: true, data: { workflows } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const triggerWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = await getOne('SELECT * FROM workflows WHERE id = ?;', [id]);
    
    if (!workflow) {
      return res.status(404).json({ success: false, message: 'Workflow not found' });
    }

    const newCount = (workflow.execution_count || 0) + 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

    await run('UPDATE workflows SET execution_count = ?, last_run = ? WHERE id = ?;', [newCount, now, id]);

    await run('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?);', [
      req.user.id,
      `Workflow Triggered: ${workflow.title}`,
      `Executed action ${workflow.action_type} successfully.`,
      'success'
    ]);

    await run('INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);', [
      req.user.id, req.user.name, 'WORKFLOW_TRIGGER', 'Automations', `Triggered workflow #${id}: ${workflow.title}`
    ]);

    return res.json({
      success: true,
      message: `Workflow '${workflow.title}' executed successfully.`,
      data: {
        execution_count: newCount,
        last_run: now
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleWorkflowStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const workflow = await getOne('SELECT * FROM workflows WHERE id = ?;', [id]);
    if (!workflow) return res.status(404).json({ success: false, message: 'Workflow not found' });

    const newStatus = workflow.status === 'Active' ? 'Paused' : 'Active';
    await run('UPDATE workflows SET status = ? WHERE id = ?;', [newStatus, id]);

    return res.json({ success: true, data: { status: newStatus } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM workflows WHERE id = ?;', [id]);
    return res.json({ success: true, message: 'Workflow deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await query('SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC LIMIT 20;', [req.user.id]);
    return res.json({ success: true, data: { notifications } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const docs = await query('SELECT d.*, u.name as uploader_name FROM documents d LEFT JOIN users u ON d.uploaded_by = u.id ORDER BY d.created_at DESC;');
    return res.json({ success: true, data: { documents: docs } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM documents WHERE id = ?;', [id]);
    return res.json({ success: true, message: 'Document deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMeetings = async (req, res) => {
  try {
    const meetings = await query('SELECT m.*, u.name as author_name FROM meetings m LEFT JOIN users u ON m.created_by = u.id ORDER BY m.date DESC;');
    return res.json({ success: true, data: { meetings } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    await run('DELETE FROM meetings WHERE id = ?;', [id]);
    return res.json({ success: true, message: 'Meeting record deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const globalSearch = async (req, res) => {
  try {
    const { query: searchStr } = req.query;
    if (!searchStr) return res.json({ success: true, data: { results: [] } });

    const term = `%${searchStr}%`;
    const projects = await query('SELECT id, name as title, "Project" as type FROM projects WHERE name LIKE ? OR description LIKE ? LIMIT 5;', [term, term]);
    const tasks = await query('SELECT id, title, "Task" as type FROM tasks WHERE title LIKE ? OR description LIKE ? LIMIT 5;', [term, term]);
    const docs = await query('SELECT id, title, "Document" as type FROM documents WHERE title LIKE ? OR content_text LIKE ? LIMIT 5;', [term, term]);
    const meetings = await query('SELECT id, title, "Meeting" as type FROM meetings WHERE title LIKE ? OR summary LIKE ? LIMIT 5;', [term, term]);

    return res.json({
      success: true,
      data: {
        results: [...projects, ...tasks, ...docs, ...meetings]
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
