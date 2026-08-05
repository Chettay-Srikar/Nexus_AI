import { query, getOne } from '../config/db.js';

export const getKnowledgeBase = async (req, res) => {
  try {
    const items = await query('SELECT * FROM knowledge_items ORDER BY created_at DESC;');
    res.json({ success: true, data: { items } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching knowledge items', error: err.message });
  }
};

export const getKnowledgeItems = async (req, res) => {
  return getKnowledgeBase(req, res);
};

export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await getOne('SELECT * FROM documents WHERE id = ?;', [id]);
    if (!document) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, data: { document } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching document', error: err.message });
  }
};

export const getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await getOne('SELECT * FROM meetings WHERE id = ?;', [id]);
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });
    res.json({ success: true, data: { meeting } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching meeting', error: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await query('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC;', [userId]);
    res.json({ success: true, data: { notifications } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching notifications', error: err.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50;');
    res.json({ success: true, data: { logs } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching audit logs', error: err.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, role, department, avatar_url, phone, created_at FROM users ORDER BY name ASC;');
    res.json({ success: true, data: { users } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: err.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await query('SELECT * FROM departments ORDER BY name ASC;');
    res.json({ success: true, data: { departments } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching departments', error: err.message });
  }
};
