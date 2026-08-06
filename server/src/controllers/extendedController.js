import { query, getOne, supabase } from '../config/db.js';

const DEMO_KNOWLEDGE_ITEMS = [
  {
    id: 1,
    title: 'SOC2 Type II Security Compliance & Data Encryption',
    category: 'Security',
    tags: 'SOC2, Encryption, Security',
    content: 'All data at rest is encrypted using AES-256 and in transit using TLS 1.3. Access controls follow strict zero-trust principle.'
  },
  {
    id: 2,
    title: 'Microservice Deployment & Kubernetes Helm Standard',
    category: 'Engineering',
    tags: 'Kubernetes, Helm, CI/CD',
    content: 'Standard deployment workflow requires passing integration tests and getting signoff from 2 senior engineers before rolling out.'
  },
  {
    id: 3,
    title: 'Employee PTO & Remote Work Policy 2026',
    category: 'HR',
    tags: 'PTO, Remote Work, HR',
    content: 'Full-time employees receive 25 days of annual paid leave with flexible work-from-home options.'
  },
  {
    id: 4,
    title: 'Customer SLA Escalation Matrix & Incident Triage',
    category: 'Support',
    tags: 'SLA, Escalation, Support',
    content: 'P0 incidents require 15-minute response times with continuous updates every 30 minutes until resolution.'
  }
];

export const getKnowledgeBase = async (req, res) => {
  try {
    let items = await query('SELECT * FROM knowledge_items ORDER BY created_at DESC;');
    if (!items || !Array.isArray(items) || items.length === 0) {
      items = DEMO_KNOWLEDGE_ITEMS;
    }
    res.json({ success: true, data: { items } });
  } catch (err) {
    res.json({ success: true, data: { items: DEMO_KNOWLEDGE_ITEMS } });
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
    let users = [];
    if (supabase) {
      const { data } = await supabase.from('profiles').select('*').order('full_name', { ascending: true });
      if (data && data.length > 0) {
        users = data.map(u => ({
          id: u.id,
          name: u.full_name || u.name || 'Enterprise User',
          email: u.email,
          role: u.role || 'Employee',
          department: u.department || 'Engineering',
          avatar_url: u.avatar_url,
          phone: u.phone || '+1-555-0192',
          status: u.status || 'ACTIVE',
          created_at: u.created_at
        }));
      }
    }

    if (!users || users.length === 0) {
      users = [
        { id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', name: 'Sarah Jenkins', email: 'admin@nexusai.com', role: 'Administrator', department: 'Executive', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', phone: '+1-555-0192', created_at: '2026-01-15' },
        { id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', name: 'David Chen', email: 'exec@nexusai.com', role: 'Executive', department: 'Executive', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', phone: '+1-555-0184', created_at: '2026-02-01' },
        { id: 'cccccccc-cccc-cccc-cccc-cccccccccccc', name: 'Alex Rivera', email: 'manager@nexusai.com', role: 'Manager', department: 'Engineering', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', phone: '+1-555-0177', created_at: '2026-02-10' },
        { id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', name: 'Marcus Vance', email: 'employee@nexusai.com', role: 'Employee', department: 'Engineering', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus', phone: '+1-555-0163', created_at: '2026-03-01' }
      ];
    }
    return res.json({ success: true, data: { users } });
  } catch (err) {
    console.error('Get users error:', err);
    return res.json({ success: true, data: { users: [] } });
  }
};

export const getDepartments = async (req, res) => {
  try {
    let departments = await query('SELECT * FROM departments ORDER BY name ASC;');
    if (!departments || !Array.isArray(departments) || departments.length === 0) {
      departments = [
        { id: 1, name: 'Engineering', code: 'ENG', head_count: 24, budget: 1200000, manager_name: 'Alex Rivera' },
        { id: 2, name: 'Marketing', code: 'MKT', head_count: 12, budget: 650000, manager_name: 'Jessica Taylor' },
        { id: 3, name: 'Executive', code: 'EXEC', head_count: 6, budget: 2100000, manager_name: 'Sarah Jenkins' },
        { id: 4, name: 'HR & Governance', code: 'HR', head_count: 8, budget: 400000, manager_name: 'David Chen' }
      ];
    }
    res.json({ success: true, data: { departments } });
  } catch (err) {
    res.json({ success: true, data: { departments: [] } });
  }
};
