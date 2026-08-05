import { run, query } from './db.js';
import bcrypt from 'bcryptjs';

export async function initDb() {
  console.log('Initializing Database Tables & Schema...');

  // Enable foreign keys
  await run('PRAGMA foreign_keys = ON;');

  // Users table
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Employee',
      department TEXT NOT NULL DEFAULT 'Engineering',
      avatar_url TEXT,
      phone TEXT DEFAULT '+1 (555) 019-2831',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Departments table
  await run(`
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      code TEXT UNIQUE NOT NULL,
      budget REAL DEFAULT 0,
      head_count INTEGER DEFAULT 1,
      manager_id INTEGER,
      FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Projects table
  await run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'In Progress',
      priority TEXT DEFAULT 'Medium',
      progress INTEGER DEFAULT 0,
      budget REAL DEFAULT 0,
      risk_score INTEGER DEFAULT 15,
      department TEXT DEFAULT 'Engineering',
      start_date DATE,
      end_date DATE,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  // Tasks table
  await run(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'To Do',
      priority TEXT DEFAULT 'Medium',
      due_date DATE,
      assigned_to INTEGER,
      estimated_hours REAL DEFAULT 8,
      risk_score INTEGER DEFAULT 10,
      delay_prediction TEXT DEFAULT 'On Track',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    );
  `);

  // Documents table
  await run(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      content_text TEXT,
      summary TEXT,
      entities_json TEXT,
      deadlines_json TEXT,
      uploaded_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (uploaded_by) REFERENCES users(id)
    );
  `);

  // Meetings table
  await run(`
    CREATE TABLE IF NOT EXISTS meetings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date DATE NOT NULL,
      transcript TEXT NOT NULL,
      summary TEXT,
      key_decisions TEXT,
      action_items TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );
  `);

  // Workflows table
  await run(`
    CREATE TABLE IF NOT EXISTS workflows (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      trigger_type TEXT NOT NULL,
      action_type TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      last_run DATETIME,
      execution_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Knowledge Items table
  await run(`
    CREATE TABLE IF NOT EXISTS knowledge_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Audit Logs table
  await run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      user_name TEXT,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Notifications table
  await run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info',
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Seed default admin user & demo data if users table is empty
  const existingUsers = await query('SELECT COUNT(*) as count FROM users;');
  if (existingUsers[0].count === 0) {
    console.log('Seeding initial database data...');
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedUserPassword = await bcrypt.hash('user123', 10);

    // Insert Users
    await run(`
      INSERT INTO users (name, email, password_hash, role, department) VALUES
      ('Sarah Jenkins', 'admin@nexusai.com', '${hashedAdminPassword}', 'Administrator', 'Executive'),
      ('David Chen', 'exec@nexusai.com', '${hashedUserPassword}', 'Executive', 'Executive'),
      ('Alex Rivera', 'manager@nexusai.com', '${hashedUserPassword}', 'Manager', 'Engineering'),
      ('Elena Rostova', 'hr@nexusai.com', '${hashedUserPassword}', 'Manager', 'HR'),
      ('Marcus Vance', 'employee@nexusai.com', '${hashedUserPassword}', 'Employee', 'Engineering');
    `);

    // Insert Departments
    await run(`
      INSERT INTO departments (name, code, budget, head_count, manager_id) VALUES
      ('Executive', 'EXEC', 500000, 4, 1),
      ('Engineering', 'ENG', 1200000, 24, 3),
      ('Human Resources', 'HR', 300000, 8, 4),
      ('Marketing & Growth', 'MKT', 450000, 12, 3),
      ('Customer Support', 'SUP', 250000, 15, 3);
    `);

    // Insert Knowledge Base Items
    await run(`
      INSERT INTO knowledge_items (title, category, content, tags) VALUES
      ('Enterprise SOC2 Compliance Policy', 'Security', 'All employee devices must have disc encryption and 2FA enabled at all times.', 'SOC2, Security, Policy'),
      ('Engineering Architecture Guidelines', 'Engineering', 'Microservices communicate via REST & gRPC with mandatory telemetry tracing.', 'Architecture, Dev'),
      ('Remote Work & Leave Request Policy', 'HR', 'Employees receive 20 days PTO annually. Approvals are managed via NexusAI automation.', 'HR, PTO, Leave'),
      ('Q3 Customer Ticket Escalation Matrix', 'Support', 'Level 1 tickets are auto-analyzed by Gemini AI. Level 3 escalates to lead engineering within 2 hours.', 'Support, AI, SLA');
    `);

    // Insert Projects
    await run(`
      INSERT INTO projects (name, description, status, priority, progress, budget, risk_score, department, start_date, end_date, created_by) VALUES
      ('Enterprise Cloud Migration', 'Migrate core monolithic services to distributed microservices architecture.', 'In Progress', 'Critical', 65, 120000, 78, 'Engineering', '2026-06-01', '2026-09-30', 3),
      ('Q3 Marketing Rebrand', 'Launch updated global branding campaign across digital channels.', 'Delayed', 'High', 30, 45000, 85, 'Marketing', '2026-07-01', '2026-08-30', 3),
      ('AI Customer Support Bot', 'Integrate Gemini powered assistant for level 1 customer tickets.', 'In Progress', 'High', 85, 60000, 20, 'Support', '2026-05-15', '2026-08-15', 3),
      ('Annual Compliance Audit', 'Comprehensive SOC2 Type II compliance audit preparation.', 'Planning', 'Medium', 15, 25000, 40, 'HR', '2026-08-01', '2026-11-30', 4);
    `);

    // Insert Tasks
    await run(`
      INSERT INTO tasks (project_id, title, description, status, priority, due_date, assigned_to, estimated_hours, risk_score, delay_prediction) VALUES
      (1, 'Database Sharding Schema Design', 'Finalize postgres table partition schemas for tenant data.', 'In Progress', 'Critical', '2026-08-10', 5, 24, 75, 'High Risk of Delay'),
      (1, 'API Gateway Rate Limit Setup', 'Configure Express rate limiters and standard helmet security.', 'Completed', 'High', '2026-08-02', 5, 8, 10, 'On Track'),
      (2, 'Brand Guidelines PDF Signoff', 'Final review of color palettes and typography rules.', 'To Do', 'High', '2026-08-05', 4, 12, 90, 'Overdue'),
      (3, 'Gemini Prompt Context Fine-Tuning', 'Optimize prompt templates for customer ticket classification.', 'In Progress', 'Medium', '2026-08-12', 5, 16, 15, 'On Track');
    `);

    // Insert Workflows
    await run(`
      INSERT INTO workflows (title, trigger_type, action_type, status, last_run, execution_count) VALUES
      ('Automated Leave Approval', 'HR Leave Submitted', 'Update Calendar & HR Record', 'Active', '2026-08-05 10:30:00', 42),
      ('Project Risk Escalation', 'Task Overdue > 3 Days', 'Notify Department Manager & Exec', 'Active', '2026-08-06 01:00:00', 18),
      ('Weekly Meeting Summary Dispatch', 'Meeting Transcript Uploaded', 'AI Summary & Task Assignment Email', 'Active', '2026-08-04 16:00:00', 65);
    `);

    // Insert Notifications
    await run(`
      INSERT INTO notifications (user_id, title, message, type) VALUES
      (1, 'System Alert', 'Database backup completed successfully at 02:00 AM.', 'info'),
      (3, 'Project Risk Warning', 'Q3 Marketing Rebrand has crossed the 80% risk threshold.', 'risk'),
      (5, 'Task Assigned', 'You have been assigned to Database Sharding Schema Design.', 'info');
    `);

    // Insert Sample Meetings
    await run(`
      INSERT INTO meetings (title, date, transcript, summary, key_decisions, action_items, created_by) VALUES
      ('Q3 Product Strategy Sync', '2026-08-04', 
       'Sarah: Welcome everyone. We need to align on the Cloud Migration milestone. Alex: We are blocked on sharding schema design due to scale projections. Elena: HR has approved two senior backend contractors starting next week. Sarah: Perfect. Let us aim for beta deployment by end of August.',
       'The team discussed Cloud Migration progress and scaling blockers. Senior backend contractors were approved by HR.',
       'Approved hiring of 2 senior backend contractors; Maintained end of August beta target.',
       'Marcus to finalize database sharding schema design by Aug 10; Elena to finish contractor onboarding paperwork.', 1);
    `);

    console.log('Database seeded successfully!');
  }
}
