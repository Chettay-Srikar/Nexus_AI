import { query, run, getOne } from '../config/db.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await query(`
      SELECT p.*, u.name as owner_name 
      FROM projects p 
      LEFT JOIN users u ON p.created_by = u.id
      ORDER BY p.id DESC;
    `);
    return res.json({ success: true, data: { projects } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getOne('SELECT p.*, u.name as owner_name FROM projects p LEFT JOIN users u ON p.created_by = u.id WHERE p.id = ?;', [id]);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    
    const tasks = await query('SELECT t.*, u.name as assignee_name FROM tasks t LEFT JOIN users u ON t.assigned_to = u.id WHERE t.project_id = ?;', [id]);
    return res.json({ success: true, data: { project, tasks } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, priority, budget, department, start_date, end_date } = req.body;
    const result = await run(
      `INSERT INTO projects (name, description, priority, budget, department, start_date, end_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [name, description, priority || 'Medium', budget || 0, department || req.user.department, start_date, end_date, req.user.id]
    );

    const newProject = await getOne('SELECT * FROM projects WHERE id = ?;', [result.lastID]);
    
    await run(`INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);`, [
      req.user.id, req.user.name, 'PROJECT_CREATE', 'Projects', `Created project: ${name}`
    ]);

    return res.status(201).json({ success: true, data: { project: newProject } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, priority, status, budget, department, progress, risk_score } = req.body;

    const existing = await getOne('SELECT * FROM projects WHERE id = ?;', [id]);
    if (!existing) return res.status(404).json({ success: false, message: 'Project not found' });

    await run(
      `UPDATE projects SET name = ?, description = ?, priority = ?, status = ?, budget = ?, department = ?, progress = ?, risk_score = ? WHERE id = ?;`,
      [
        name || existing.name,
        description || existing.description,
        priority || existing.priority,
        status || existing.status,
        budget !== undefined ? budget : existing.budget,
        department || existing.department,
        progress !== undefined ? progress : existing.progress,
        risk_score !== undefined ? risk_score : existing.risk_score,
        id
      ]
    );

    const updated = await getOne('SELECT * FROM projects WHERE id = ?;', [id]);

    await run(`INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);`, [
      req.user.id, req.user.name, 'PROJECT_UPDATE', 'Projects', `Updated project #${id}: ${updated.name}`
    ]);

    return res.json({ success: true, data: { project: updated } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await getOne('SELECT * FROM projects WHERE id = ?;', [id]);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    await run('DELETE FROM projects WHERE id = ?;', [id]);

    await run(`INSERT INTO audit_logs (user_id, user_name, action, resource, details) VALUES (?, ?, ?, ?, ?);`, [
      req.user.id, req.user.name, 'PROJECT_DELETE', 'Projects', `Deleted project #${id}: ${project.name}`
    ]);

    return res.json({ success: true, message: `Project '${project.name}' deleted successfully.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await query(`
      SELECT t.*, p.name as project_name, u.name as assignee_name, u.avatar_url as assignee_avatar
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN users u ON t.assigned_to = u.id
      ORDER BY t.due_date ASC;
    `);
    return res.json({ success: true, data: { tasks } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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
      SELECT c.*, u.name as user_name, u.avatar_url 
      FROM task_comments c 
      LEFT JOIN users u ON c.user_id = u.id 
      WHERE c.task_id = ? 
      ORDER BY c.created_at DESC;
    `, [id]);

    return res.json({ success: true, data: { task, comments } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { project_id, title, description, priority, due_date, assigned_to, estimated_hours } = req.body;
    const risk_score = priority === 'Critical' ? 85 : priority === 'High' ? 60 : 25;
    const delay_prediction = risk_score > 70 ? 'High Risk of Delay' : 'On Track';

    const result = await run(
      `INSERT INTO tasks (project_id, title, description, priority, due_date, assigned_to, estimated_hours, risk_score, delay_prediction) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [project_id, title, description, priority || 'Medium', due_date, assigned_to || req.user.id, estimated_hours || 8, risk_score, delay_prediction]
    );

    const newTask = await getOne('SELECT * FROM tasks WHERE id = ?;', [result.lastID]);
    return res.status(201).json({ success: true, data: { task: newTask } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, due_date, assigned_to, estimated_hours } = req.body;

    const existing = await getOne('SELECT * FROM tasks WHERE id = ?;', [id]);
    if (!existing) return res.status(404).json({ success: false, message: 'Task not found' });

    const risk_score = priority === 'Critical' ? 85 : priority === 'High' ? 60 : existing.risk_score;
    const delay_prediction = risk_score > 70 ? 'High Risk of Delay' : 'On Track';

    await run(
      `UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, assigned_to = ?, estimated_hours = ?, risk_score = ?, delay_prediction = ? WHERE id = ?;`,
      [
        title || existing.title,
        description || existing.description,
        priority || existing.priority,
        status || existing.status,
        due_date || existing.due_date,
        assigned_to || existing.assigned_to,
        estimated_hours !== undefined ? estimated_hours : existing.estimated_hours,
        risk_score,
        delay_prediction,
        id
      ]
    );

    const updated = await getOne('SELECT * FROM tasks WHERE id = ?;', [id]);
    return res.json({ success: true, data: { task: updated } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await getOne('SELECT * FROM tasks WHERE id = ?;', [id]);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    await run('DELETE FROM tasks WHERE id = ?;', [id]);
    return res.json({ success: true, message: `Task '${task.title}' deleted.` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await run('UPDATE tasks SET status = ? WHERE id = ?;', [status, id]);
    const updated = await getOne('SELECT * FROM tasks WHERE id = ?;', [id]);

    return res.json({ success: true, data: { task: updated } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const addTaskComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    if (!comment) return res.status(400).json({ success: false, message: 'Comment is required' });

    await run(`INSERT INTO task_comments (task_id, user_id, comment) VALUES (?, ?, ?);`, [id, req.user.id, comment]);
    const comments = await query(`
      SELECT c.*, u.name as user_name, u.avatar_url 
      FROM task_comments c 
      LEFT JOIN users u ON c.user_id = u.id 
      WHERE c.task_id = ? 
      ORDER BY c.created_at DESC;
    `, [id]);

    return res.status(201).json({ success: true, data: { comments } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
