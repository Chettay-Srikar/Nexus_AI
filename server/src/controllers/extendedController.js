import { query, run, getOne } from '../config/db.js';

// --- Detail Fetchers ---

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getOne('SELECT p.*, u.name as owner_name FROM projects p LEFT JOIN users u ON p.created_by = u.id WHERE p.id = ?;', [id]);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    const tasks = await query('SELECT t.*, u.name as assignee_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.project_id = ?;', [id]);
    return res.json({ success: true, project, tasks });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await getOne(`
      SELECT t.*, p.name as project_name, u.name as assignee_name, u.email as assignee_email
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.id = ?;
    `, [id]);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    return res.json({ success: true, task });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;
    const meeting = await getOne('SELECT m.*, u.name as author_name FROM meetings m LEFT JOIN users u ON m.created_by = u.id WHERE m.id = ?;', [id]);
    if (!meeting) return res.status(404).json({ success: false, message: 'Meeting not found' });
    return res.json({ success: true, meeting });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await getOne('SELECT d.*, u.name as uploader_name FROM documents d LEFT JOIN users u ON d.uploaded_by = u.id WHERE d.id = ?;', [id]);
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    return res.json({ success: true, document: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// --- Knowledge Base ---

export const getKnowledgeItems = async (req, res) => {
  try {
    const items = await query('SELECT * FROM knowledge_items ORDER BY id DESC;');
    return res.json({ success: true, items });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// --- Users & Departments ---

export const getUsers = async (req, res) => {
  try {
    const users = await query('SELECT id, name, email, role, department, avatar_url, phone, created_at FROM users ORDER BY id ASC;');
    return res.json({ success: true, users });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await query('SELECT d.*, u.name as manager_name FROM departments d LEFT JOIN users u ON d.manager_id = u.id;');
    return res.json({ success: true, departments });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
