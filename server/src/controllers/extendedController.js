import { query, getOne } from '../config/db.js';

export const getKnowledgeBase = async (req, res) => {
  try {
    const items = await query('SELECT * FROM knowledge_items ORDER BY created_at DESC;');
    res.json({ success: true, data: { items } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching knowledge items' });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC;', [userId]);
    res.json({ success: true, data: { notifications } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50;');
    res.json({ success: true, data: { logs } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching audit logs' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, role, department, avatar_url, phone, created_at FROM users ORDER BY name ASC;');
    res.json({ success: true, data: { users } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users' });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await query('SELECT * FROM departments ORDER BY name ASC;');
    res.json({ success: true, data: { departments } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching departments' });
  }
};
