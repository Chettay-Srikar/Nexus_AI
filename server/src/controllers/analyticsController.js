import { query, getOne } from '../config/db.js';

export const getDashboardAnalytics = async (req, res) => {
  try {
    const projects = await query('SELECT * FROM projects;');
    const tasks = await query('SELECT * FROM tasks;');
    const users = await query('SELECT id, name, role, department FROM users;');

    const activeProjects = projects.filter(p => p.status === 'In Progress').length;
    const delayedProjects = projects.filter(p => p.status === 'Delayed').length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const highRiskTasks = tasks.filter(t => t.delay_prediction === 'High Risk of Delay').length;

    const data = {
      summary: {
        activeProjects,
        delayedProjects,
        completedTasks,
        highRiskTasks,
        totalTeamMembers: users.length,
        companyRiskIndex: 28,
        healthScore: 92
      },
      departmentHealth: [
        { department: 'Engineering', activeProjects: 4, healthScore: 94, risk: 'Low' },
        { department: 'Marketing', activeProjects: 2, healthScore: 78, risk: 'Medium' },
        { department: 'HR', activeProjects: 1, healthScore: 98, risk: 'Low' },
        { department: 'Support', activeProjects: 3, healthScore: 86, risk: 'Low' }
      ],
      recentProjects: projects.slice(0, 5),
      tasksSummary: tasks.slice(0, 5)
    };

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard analytics', error: err.message });
  }
};

export const getEnterpriseAnalytics = async (req, res) => {
  return getDashboardAnalytics(req, res);
};

export const getWorkflows = async (req, res) => {
  try {
    const workflows = await query('SELECT * FROM workflows ORDER BY created_at DESC;');
    res.json({ success: true, data: { workflows } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch workflows', error: err.message });
  }
};

export const triggerWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    const wf = await getOne('SELECT * FROM workflows WHERE id = ?;', [id]);
    if (!wf) return res.status(404).json({ success: false, message: 'Workflow not found' });

    const newCount = (wf.execution_count || 0) + 1;
    const now = new Date().toISOString();

    await query('UPDATE workflows SET execution_count = ?, last_run = ? WHERE id = ?;', [newCount, now, id]);
    await query('INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?);', [
      req.user.id,
      `Workflow Triggered: ${wf.title}`,
      `Automated execution completed for ${wf.action_type}`,
      'success'
    ]);

    await query('INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);', [
      req.user.id,
      req.user.name,
      'TRIGGER',
      'WORKFLOW',
      `Executed workflow ${wf.title}`
    ]);

    res.json({
      success: true,
      message: `Workflow '${wf.title}' executed successfully.`,
      data: {
        id: wf.id,
        execution_count: newCount,
        last_run: now
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to trigger workflow', error: err.message });
  }
};

export const toggleWorkflowStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const wf = await getOne('SELECT * FROM workflows WHERE id = ?;', [id]);
    if (!wf) return res.status(404).json({ success: false, message: 'Workflow not found' });

    const newStatus = wf.status === 'Active' ? 'Paused' : 'Active';
    await query('UPDATE workflows SET status = ? WHERE id = ?;', [newStatus, id]);

    res.json({ success: true, message: `Workflow status updated to ${newStatus}`, data: { status: newStatus } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to toggle workflow status', error: err.message });
  }
};

export const deleteWorkflow = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM workflows WHERE id = ?;', [id]);
    res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete workflow', error: err.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const documents = await query('SELECT * FROM documents ORDER BY created_at DESC;');
    res.json({ success: true, data: { documents } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents', error: err.message });
  }
};

export const getMeetings = async (req, res) => {
  try {
    const meetings = await query('SELECT * FROM meetings ORDER BY date DESC;');
    res.json({ success: true, data: { meetings } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch meetings', error: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM documents WHERE id = ?;', [id]);
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete document', error: err.message });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM meetings WHERE id = ?;', [id]);
    res.json({ success: true, message: 'Meeting deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete meeting', error: err.message });
  }
};

export const globalSearch = async (req, res) => {
  try {
    const { query: q } = req.query;
    if (!q || !q.trim()) return res.json({ success: true, data: { results: [] } });

    const searchTerm = `%${q.trim()}%`;

    const projects = await query('SELECT id, name as title, description, "Project" as type FROM projects WHERE name LIKE ? OR description LIKE ? LIMIT 5;', [searchTerm, searchTerm]);
    const tasks = await query('SELECT id, title, description, "Task" as type FROM tasks WHERE title LIKE ? OR description LIKE ? LIMIT 5;', [searchTerm, searchTerm]);
    const docs = await query('SELECT id, title, file_type as description, "Document" as type FROM documents WHERE title LIKE ? LIMIT 5;', [searchTerm]);
    const meetings = await query('SELECT id, title, date as description, "Meeting" as type FROM meetings WHERE title LIKE ? LIMIT 5;', [searchTerm]);

    const results = [...projects, ...tasks, ...docs, ...meetings];
    res.json({ success: true, data: { results } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Global search error', error: err.message });
  }
};
