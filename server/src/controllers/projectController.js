import { query, getOne } from '../config/db.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await query('SELECT * FROM projects ORDER BY created_at DESC;');
    res.json({ success: true, data: { projects } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch projects', error: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getOne('SELECT * FROM projects WHERE id = ?;', [id]);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    const tasks = await query('SELECT * FROM tasks WHERE project_id = ?;', [id]);
    res.json({ success: true, data: { project, tasks } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch project details', error: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, priority = 'Medium', status = 'In Progress', budget = 50000, department = 'Engineering' } = req.body;
    const rows = await query(
      `INSERT INTO projects (name, description, priority, status, budget, department, created_by) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *;`,
      [name, description, priority, status, budget, department, req.user ? req.user.id : null]
    );

    const project = rows[0] || { name, description, priority, status, budget, department };

    await query(`INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);`, [
      req.user ? req.user.id : null,
      req.user ? req.user.name : 'System',
      'CREATE',
      'PROJECT',
      `Created project ${name}`
    ]);

    res.status(201).json({ success: true, message: 'Project created successfully', data: { project } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create project', error: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, priority, status, budget, department } = req.body;
    await query(
      `UPDATE projects SET name = ?, description = ?, priority = ?, status = ?, budget = ?, department = ? WHERE id = ?;`,
      [name, description, priority, status, budget, department, id]
    );
    const project = await getOne('SELECT * FROM projects WHERE id = ?;', [id]);

    await query(`INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);`, [
      req.user ? req.user.id : null,
      req.user ? req.user.name : 'System',
      'UPDATE',
      'PROJECT',
      `Updated project ${name}`
    ]);

    res.json({ success: true, message: 'Project updated successfully', data: { project } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update project', error: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM projects WHERE id = ?;', [id]);

    await query(`INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);`, [
      req.user ? req.user.id : null,
      req.user ? req.user.name : 'System',
      'DELETE',
      'PROJECT',
      `Deleted project ${id}`
    ]);

    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete project', error: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await query(`
      SELECT t.*, p.name as project_name, u.name as assignee_name 
      FROM tasks t 
      LEFT JOIN projects p ON t.project_id = p.id 
      LEFT JOIN users u ON t.assigned_to = u.id 
      ORDER BY t.created_at DESC;
    `);
    res.json({ success: true, data: { tasks } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch tasks', error: err.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await getOne(`
      SELECT t.*, p.name as project_name, u.name as assignee_name 
      FROM tasks t 
      LEFT JOIN projects p ON t.project_id = p.id 
      LEFT JOIN users u ON t.assigned_to = u.id 
      WHERE t.id = ?;
    `, [id]);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    const comments = await query(`
      SELECT c.*, u.name as user_name 
      FROM task_comments c 
      LEFT JOIN users u ON c.user_id = u.id 
      WHERE c.task_id = ? 
      ORDER BY c.created_at ASC;
    `, [id]);
    res.json({ success: true, data: { task, comments } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch task detail', error: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { project_id, title, description, priority = 'Medium', status = 'To Do', due_date, estimated_hours = 8 } = req.body;

    const delay_prediction = priority === 'Critical' || priority === 'High' ? 'High Risk of Delay' : 'On Track';

    const rows = await query(
      `INSERT INTO tasks (project_id, title, description, priority, status, due_date, assigned_to, estimated_hours, delay_prediction) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING *;`,
      [project_id, title, description, priority, status, due_date, req.user ? req.user.id : null, estimated_hours, delay_prediction]
    );

    const task = rows[0] || { title, priority, status };

    res.status(201).json({ success: true, message: 'Task created successfully', data: { task } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create task', error: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, due_date, estimated_hours } = req.body;

    await query(
      `UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, estimated_hours = ? WHERE id = ?;`,
      [title, description, priority, status, due_date, estimated_hours, id]
    );
    const task = await getOne('SELECT * FROM tasks WHERE id = ?;', [id]);

    res.json({ success: true, message: 'Task updated successfully', data: { task } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update task', error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM tasks WHERE id = ?;', [id]);
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete task', error: err.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await query('UPDATE tasks SET status = ? WHERE id = ?;', [status, id]);
    const task = await getOne('SELECT * FROM tasks WHERE id = ?;', [id]);
    res.json({ success: true, message: 'Task status updated', data: { task } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update task status', error: err.message });
  }
};

export const addTaskComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    await query(`INSERT INTO task_comments (task_id, user_id, comment) VALUES (?, ?, ?);`, [id, req.user.id, comment]);
    const comments = await query(`
      SELECT c.*, u.name as user_name 
      FROM task_comments c 
      LEFT JOIN users u ON c.user_id = u.id 
      WHERE c.task_id = ? 
      ORDER BY c.created_at ASC;
    `, [id]);
    res.status(201).json({ success: true, message: 'Comment added', data: { comments } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add task comment', error: err.message });
  }
};
