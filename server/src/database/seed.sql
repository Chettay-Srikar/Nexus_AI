-- ======================================================
-- NEXUSAI ENTERPRISE POSTGRESQL SEED DATA
-- File: seed.sql
-- ======================================================

-- 1. SEED DEPARTMENTS
INSERT INTO departments (id, name, code, description, budget, head_count, location) VALUES
('11111111-1111-1111-1111-111111111111', 'Executive', 'EXEC', 'Executive Leadership & Global Operations', 500000.00, 4, 'San Francisco, CA'),
('22222222-2222-2222-2222-222222222222', 'Engineering', 'ENG', 'Core Platform Engineering & AI Labs', 1200000.00, 24, 'San Francisco, CA'),
('33333333-3333-3333-3333-333333333333', 'Human Resources', 'HR', 'People Operations & Global Talent', 300000.00, 8, 'New York, NY'),
('44444444-4444-4444-4444-444444444444', 'Marketing & Growth', 'MKT', 'Brand Strategy & Growth Marketing', 450000.00, 12, 'London, UK'),
('55555555-5555-5555-5555-555555555555', 'Customer Support', 'SUP', 'Level 1-3 Support & Client Success', 250000.00, 15, 'Austin, TX')
ON CONFLICT (name) DO NOTHING;

-- 2. SEED PROFILES (Passwords hashed for 'admin123' and 'user123')
INSERT INTO profiles (id, email, password_hash, full_name, role, department_id, job_title, avatar_url) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@nexusai.com', '$2a$10$0k8kH8FwZ8b8hK6S.4pY4u6p0b9m0O9s8y7x6w5v4u3t2s1r0q', 'Sarah Jenkins', 'Administrator', '11111111-1111-1111-1111-111111111111', 'Chief Operating Officer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'exec@nexusai.com', '$2a$10$0k8kH8FwZ8b8hK6S.4pY4u6p0b9m0O9s8y7x6w5v4u3t2s1r0q', 'David Chen', 'Executive', '11111111-1111-1111-1111-111111111111', 'VP of Enterprise Operations', 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'manager@nexusai.com', '$2a$10$0k8kH8FwZ8b8hK6S.4pY4u6p0b9m0O9s8y7x6w5v4u3t2s1r0q', 'Alex Rivera', 'Manager', '22222222-2222-2222-2222-222222222222', 'Director of Engineering', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'hr@nexusai.com', '$2a$10$0k8kH8FwZ8b8hK6S.4pY4u6p0b9m0O9s8y7x6w5v4u3t2s1r0q', 'Elena Rostova', 'Manager', '33333333-3333-3333-3333-333333333333', 'Head of HR & Talent', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'employee@nexusai.com', '$2a$10$0k8kH8FwZ8b8hK6S.4pY4u6p0b9m0O9s8y7x6w5v4u3t2s1r0q', 'Marcus Vance', 'Employee', '22222222-2222-2222-2222-222222222222', 'Senior Staff Database Engineer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus')
ON CONFLICT (email) DO NOTHING;

-- 3. SEED PROJECTS
INSERT INTO projects (id, name, description, department_id, manager_id, status, priority, budget, risk_score, completion_percentage, created_by) VALUES
('p1111111-1111-1111-1111-111111111111', 'Enterprise Cloud Migration', 'Migrate core monolithic services to distributed microservices architecture.', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'In Progress', 'Critical', 120000.00, 78, 65, 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
('p2222222-2222-2222-2222-222222222222', 'Q3 Marketing Rebrand', 'Launch updated global branding campaign across digital channels.', '44444444-4444-4444-4444-444444444444', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Delayed', 'High', 45000.00, 85, 30, 'cccccccc-cccc-cccc-cccc-cccccccccccc')
ON CONFLICT (id) DO NOTHING;

-- 4. SEED TASKS
INSERT INTO tasks (id, project_id, title, description, assigned_to, priority, status, estimated_hours, risk_score, delay_prediction, deadline) VALUES
('t1111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 'Database Sharding Schema Design', 'Finalize postgres table partition schemas for tenant data.', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Critical', 'In Progress', 24.00, 75, 'High Risk of Delay', '2026-08-10'),
('t2222222-2222-2222-2222-222222222222', 'p1111111-1111-1111-1111-111111111111', 'API Gateway Rate Limit Setup', 'Configure Express rate limiters and standard helmet security.', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'High', 'Completed', 8.00, 10, 'On Track', '2026-08-02')
ON CONFLICT (id) DO NOTHING;

-- 5. SEED SYSTEM SETTINGS
INSERT INTO system_settings (setting_key, setting_value) VALUES
('ai_config', '{"model": "gemini-1.5-flash", "temperature": 0.2, "max_tokens": 2048}'::jsonb),
('security_governance', '{"mfa_required": true, "session_timeout_mins": 60, "soc2_audit_mode": true}'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;
