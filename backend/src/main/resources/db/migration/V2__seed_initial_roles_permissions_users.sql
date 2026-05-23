INSERT INTO permissions (name, description) VALUES
('USER_CREATE', 'Create new users'),
('USER_READ', 'View users'),
('USER_UPDATE', 'Update users'),
('USER_DELETE', 'Disable or delete users'),
('ROLE_ASSIGN', 'Assign roles to users'),
('AUDIT_VIEW', 'View audit logs'),
('DASHBOARD_VIEW', 'View dashboard data'),
('ROLE_MANAGE', 'Create and update roles'),
('PERMISSION_MANAGE', 'Manage permissions')
ON CONFLICT (name) DO NOTHING;

INSERT INTO roles (name, description) VALUES
('ADMIN', 'System administrator with full access'),
('MANAGER', 'Manager with limited administration access'),
('AUDITOR', 'Read-only audit and dashboard access')
ON CONFLICT (name) DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'ADMIN'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('USER_READ', 'USER_UPDATE', 'DASHBOARD_VIEW')
WHERE r.name = 'MANAGER'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
JOIN permissions p ON p.name IN ('AUDIT_VIEW', 'DASHBOARD_VIEW')
WHERE r.name = 'AUDITOR'
ON CONFLICT DO NOTHING;

INSERT INTO users (full_name, email, password, enabled, role_id)
SELECT 
    'Admin User',
    'admin@accessportal.com',
    '$2a$10$Jq7Q8W5J8WqHYCvSryIhPeHFtEKzkPSclA9NzJSPnHPhuVIOtdBYG',
    TRUE,
    r.id
FROM roles r
WHERE r.name = 'ADMIN'
ON CONFLICT (email) DO NOTHING;
