-- ======================================================
-- NEXUSAI ENTERPRISE SUPABASE SEED DATA
-- Seed File: seed.sql
-- ======================================================

-- Seed Departments
INSERT INTO departments (id, name, description, budget, location) VALUES
('11111111-1111-1111-1111-111111111111', 'Executive', 'Executive Leadership & Global Operations', 500000.00, 'San Francisco, CA'),
('22222222-2222-2222-2222-222222222222', 'Engineering', 'Core Platform Engineering & AI Labs', 1200000.00, 'San Francisco, CA'),
('33333333-3333-3333-3333-333333333333', 'Human Resources', 'People Operations & Global Talent', 300000.00, 'New York, NY'),
('44444444-4444-4444-4444-444444444444', 'Marketing & Growth', 'Brand Strategy & Growth Marketing', 450000.00, 'London, UK'),
('55555555-5555-5555-5555-555555555555', 'Customer Support', 'Level 1-3 Support & Client Success', 250000.00, 'Austin, TX')
ON CONFLICT (name) DO NOTHING;

-- Seed Profiles
INSERT INTO profiles (id, email, full_name, role, department_id, job_title, avatar_url) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@nexusai.com', 'Sarah Jenkins', 'Administrator', '11111111-1111-1111-1111-111111111111', 'Chief Operating Officer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'exec@nexusai.com', 'David Chen', 'Executive', '11111111-1111-1111-1111-111111111111', 'VP of Enterprise Operations', 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'manager@nexusai.com', 'Alex Rivera', 'Manager', '22222222-2222-2222-2222-222222222222', 'Director of Engineering', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'hr@nexusai.com', 'Elena Rostova', 'Manager', '33333333-3333-3333-3333-333333333333', 'Head of HR & Talent', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'employee@nexusai.com', 'Marcus Vance', 'Employee', '22222222-2222-2222-2222-222222222222', 'Senior Staff Database Engineer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus')
ON CONFLICT (email) DO NOTHING;

-- Seed Projects
INSERT INTO projects (id, name, description, department_id, manager_id, status, priority, budget, risk_score, completion_percentage) VALUES
('p1111111-1111-1111-1111-111111111111', 'Enterprise Cloud Migration', 'Migrate core monolithic services to distributed microservices architecture.', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'In Progress', 'Critical', 120000.00, 78, 65),
('p2222222-2222-2222-2222-222222222222', 'Q3 Marketing Rebrand', 'Launch updated global branding campaign across digital channels.', '44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Delayed', 'High', 45000.00, 85, 30);

-- Seed System Settings
INSERT INTO system_settings (setting_key, setting_value) VALUES
('ai_config', '{"model": "gemini-1.5-flash", "temperature": 0.2, "max_tokens": 2048}'::jsonb),
('security_governance', '{"mfa_required": true, "session_timeout_mins": 60, "soc2_audit_mode": true}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;
