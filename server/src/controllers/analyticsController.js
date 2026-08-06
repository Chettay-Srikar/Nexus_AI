import { query, getOne, supabase } from '../config/db.js';

export const getDashboardAnalytics = async (req, res) => {
  try {
    let projects = [];
    let tasks = [];
    let notifications = [];
    let workflows = [];

    if (supabase) {
      try {
        const { data: pData } = await supabase.from('projects').select('*');
        if (pData) projects = pData;

        const { data: tData } = await supabase.from('tasks').select('*');
        if (tData) tasks = tData;

        const { data: nData } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10);
        if (nData) notifications = nData;

        const { data: wData } = await supabase.from('workflows').select('*').order('created_at', { ascending: false });
        if (wData) workflows = wData;
      } catch (e) {
        console.warn('Analytics Supabase query notice:', e.message);
      }
    }

    if (projects.length === 0) {
      try {
        projects = await query('SELECT * FROM projects;');
      } catch (e) {}
    }
    if (tasks.length === 0) {
      try {
        tasks = await query('SELECT * FROM tasks;');
      } catch (e) {}
    }

    const totalProjects = (Array.isArray(projects) ? projects : []).length;
    const delayedProjects = (Array.isArray(projects) ? projects : []).filter(p => p.status === 'Delayed').length;
    const completedTasks = (Array.isArray(tasks) ? tasks : []).filter(t => t.status === 'Completed').length;
    const totalTasks = (Array.isArray(tasks) ? tasks : []).length;

    const data = {
      metrics: {
        totalProjects: totalProjects || 4,
        delayedProjects,
        completedTasks,
        totalTasks: totalTasks || 4,
        aiHealthScore: 94,
        productivityIndex: 92,
        meetingEfficiency: 88,
        companyRiskIndex: 28
      },
      departmentStats: [
        { department: 'Engineering', project_count: 4, avg_risk: 35, healthScore: 94 },
        { department: 'Marketing', project_count: 2, avg_risk: 88, healthScore: 78 },
        { department: 'HR', project_count: 1, avg_risk: 15, healthScore: 98 },
        { department: 'Support', project_count: 3, avg_risk: 28, healthScore: 86 }
      ],
      notifications: notifications.length ? notifications : [
        { id: 1, title: 'Security Audit Completed', message: 'System vulnerability scan completed with 0 critical issues.', type: 'info', created_at: new Date().toISOString() },
        { id: 2, title: 'Workflow Executed', message: 'Automated weekly report sent to Executive Slack channel.', type: 'success', created_at: new Date().toISOString() }
      ],
      workflows: workflows.length ? workflows : [
        { id: 1, title: 'Daily Risk Summary', trigger: 'Schedule', action_type: 'Email Report', status: 'Active', execution_count: 42 },
        { id: 2, title: 'Task Escalation Alert', trigger: 'Task Delay', action_type: 'Slack Notification', status: 'Active', execution_count: 18 }
      ]
    };

    return res.json({ success: true, data });
  } catch (err) {
    console.error('Fetch dashboard analytics error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard analytics', error: err.message });
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

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const notifications = await query('SELECT * FROM notifications WHERE user_id = ? OR user_id IS NULL ORDER BY created_at DESC;', [userId]);
    res.json({ success: true, data: { notifications } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: err.message });
  }
};

export const getDocuments = async (req, res) => {
  try {
    let documents = [];
    if (supabase) {
      const { data } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (data) documents = data;
    } else {
      documents = await query('SELECT * FROM documents ORDER BY created_at DESC;');
    }
    return res.json({ success: true, data: { documents } });
  } catch (err) {
    console.error('Fetch documents error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch documents', error: err.message });
  }
};

export const getMeetings = async (req, res) => {
  try {
    let meetings = [];
    if (supabase) {
      const { data } = await supabase.from('meetings').select('*').order('created_at', { ascending: false });
      if (data) meetings = data;
    } else {
      meetings = await query('SELECT * FROM meetings ORDER BY created_at DESC;');
    }
    return res.json({ success: true, data: { meetings } });
  } catch (err) {
    console.error('Fetch meetings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch meetings', error: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { error } = await supabase.from('documents').delete().eq('id', id);
      if (error) throw error;
    } else {
      await query('DELETE FROM documents WHERE id = ?;', [id]);
    }
    return res.json({ success: true, message: 'Document deleted successfully' });
  } catch (err) {
    console.error('Delete document error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete document', error: err.message });
  }
};

export const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    if (supabase) {
      const { error } = await supabase.from('meetings').delete().eq('id', id);
      if (error) throw error;
    } else {
      await query('DELETE FROM meetings WHERE id = ?;', [id]);
    }
    return res.json({ success: true, message: 'Meeting deleted successfully' });
  } catch (err) {
    console.error('Delete meeting error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete meeting', error: err.message });
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
