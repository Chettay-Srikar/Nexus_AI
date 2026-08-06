import { supabase, query, getOne } from '../config/db.js';

const DEMO_PROJECTS = [
  {
    name: 'Enterprise Cloud Migration',
    priority: 'High',
    status: 'In Progress',
    risk_score: 72,
    completion_percentage: 65,
    budget: 150000,
    description: 'Migrating legacy on-prem services to cloud infrastructure'
  },
  {
    name: 'Q3 Marketing Rebrand',
    priority: 'Critical',
    status: 'Delayed',
    risk_score: 88,
    completion_percentage: 41,
    budget: 85000,
    description: 'Complete brand redesign and multi-channel campaign launch'
  },
  {
    name: 'AI Analytics Pipeline',
    priority: 'Medium',
    status: 'In Progress',
    risk_score: 35,
    completion_percentage: 80,
    budget: 120000,
    description: 'Real-time telemetry and predictive risk evaluation engine'
  },
  {
    name: 'HR Automation Platform',
    priority: 'Low',
    status: 'Completed',
    risk_score: 15,
    completion_percentage: 100,
    budget: 45000,
    description: 'Automated onboarding and performance tracking workflow'
  }
];

export const getProjects = async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error fetching projects:', error);
    }

    if (!projects || projects.length === 0) {
      console.log('No projects in Supabase PostgreSQL, seeding demo enterprise projects...');
      const { data: seeded, error: seedError } = await supabase
        .from('projects')
        .insert(DEMO_PROJECTS)
        .select();

      if (!seedError && seeded) {
        return res.json({ success: true, data: { projects: seeded } });
      }
    }

    res.json({ success: true, data: { projects: projects || [] } });
  } catch (err) {
    console.error('Failed to fetch projects:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch projects', error: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', id);

    res.json({ success: true, data: { project, tasks: tasks || [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch project details', error: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, priority = 'Medium', status = 'In Progress', budget = 50000, risk_score = 30, completion_percentage = 0 } = req.body;

    // Resolve valid created_by reference to profiles.id
    let created_by = req.user ? req.user.id : null;
    if (created_by) {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', created_by)
        .maybeSingle();

      if (!existingProfile && req.user?.email) {
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', req.user.email)
          .maybeSingle();

        if (profileByEmail) {
          created_by = profileByEmail.id;
        } else {
          const { data: newProf } = await supabase
            .from('profiles')
            .upsert([{
              id: req.user.id,
              email: req.user.email,
              full_name: req.user.name || 'User',
              role: req.user.role || 'Employee'
            }], { onConflict: 'email' })
            .select('id')
            .single();

          if (newProf) created_by = newProf.id;
        }
      }
    }

    console.log('JWT User:', req.user);
    console.log('created_by:', created_by);
    console.log('Insert payload:', { name, description, priority, status, budget, risk_score, completion_percentage, created_by });

    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name,
        description,
        priority,
        status,
        budget: Number(budget),
        risk_score: Number(risk_score),
        completion_percentage: Number(completion_percentage),
        created_by
      }])
      .select();

    if (error) {
      console.error('Supabase Error creating project:', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    const project = data[0];

    try {
      await supabase.from('audit_logs').insert([{
        user_id: req.user ? req.user.id : null,
        user_name: req.user ? req.user.name : 'System',
        action: 'CREATE',
        resource: 'PROJECT',
        details: `Created project ${name}`
      }]);
    } catch (e) {
      console.warn('Audit log insert skipped:', e.message);
    }

    res.status(201).json({ success: true, message: 'Project created successfully', data: { project } });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ success: false, message: 'Failed to create project', error: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, priority, status, budget, risk_score, completion_percentage } = req.body;

    console.log('Updating Project in Supabase:', id, req.body);
    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (description !== undefined) updatePayload.description = description;
    if (priority !== undefined) updatePayload.priority = priority;
    if (status !== undefined) updatePayload.status = status;
    if (budget !== undefined) updatePayload.budget = Number(budget);
    if (risk_score !== undefined) updatePayload.risk_score = Number(risk_score);
    if (completion_percentage !== undefined) updatePayload.completion_percentage = Number(completion_percentage);

    const { data, error } = await supabase
      .from('projects')
      .update(updatePayload)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase Error updating project:', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    const project = data && data[0] ? data[0] : { id, ...updatePayload };

    try {
      await supabase.from('audit_logs').insert([{
        user_id: req.user ? req.user.id : null,
        user_name: req.user ? req.user.name : 'System',
        action: 'UPDATE',
        resource: 'PROJECT',
        details: `Updated project ${id}`
      }]);
    } catch (e) {
      console.warn('Audit log update skipped:', e.message);
    }

    res.json({ success: true, message: 'Project updated successfully', data: { project } });
  } catch (err) {
    console.error('Error updating project:', err);
    res.status(500).json({ success: false, message: 'Failed to update project', error: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting Project from Supabase:', id);
    const { data, error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase Error deleting project:', error);
      return res.status(400).json({ success: false, message: error.message });
    }

    try {
      await supabase.from('audit_logs').insert([{
        user_id: req.user ? req.user.id : null,
        user_name: req.user ? req.user.name : 'System',
        action: 'DELETE',
        resource: 'PROJECT',
        details: `Deleted project ${id}`
      }]);
    } catch (e) {
      console.warn('Audit log delete skipped:', e.message);
    }

    res.json({ success: true, message: 'Project deleted successfully', data: { id } });
  } catch (err) {
    console.error('Error deleting project:', err);
    res.status(500).json({ success: false, message: 'Failed to delete project', error: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    res.json({ success: true, data: { tasks: tasks || [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch tasks', error: err.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data: task } = await supabase.from('tasks').select('*').eq('id', id).single();
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: { task, comments: [] } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch task detail', error: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const { project_id, title, description, priority = 'Medium', status = 'To Do', due_date, estimated_hours = 8 } = req.body;
    const delay_prediction = priority === 'Critical' || priority === 'High' ? 'High Risk of Delay' : 'On Track';

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        project_id,
        title,
        description,
        priority,
        status,
        due_date,
        estimated_hours: Number(estimated_hours),
        delay_prediction
      }])
      .select();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(201).json({ success: true, message: 'Task created successfully', data: { task: data[0] } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create task', error: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, priority, status, due_date, estimated_hours } = req.body;

    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...(title && { title }),
        ...(description && { description }),
        ...(priority && { priority }),
        ...(status && { status }),
        ...(due_date && { due_date }),
        ...(estimated_hours !== undefined && { estimated_hours: Number(estimated_hours) })
      })
      .eq('id', id)
      .select();

    if (error) return res.status(400).json({ success: false, message: error.message });

    res.json({ success: true, message: 'Task updated successfully', data: { task: data[0] } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update task', error: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, message: 'Task deleted successfully', data: { id } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete task', error: err.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase.from('tasks').update({ status }).eq('id', id).select();
    if (error) return res.status(400).json({ success: false, message: error.message });
    res.json({ success: true, message: 'Task status updated', data: { task: data[0] } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update task status', error: err.message });
  }
};

export const addTaskComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    res.status(201).json({ success: true, message: 'Comment added', data: { comments: [{ id: Date.now(), comment }] } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add task comment', error: err.message });
  }
};
