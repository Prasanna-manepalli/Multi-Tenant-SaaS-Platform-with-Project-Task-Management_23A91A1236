-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================
-- SUPER ADMIN (NO TENANT)
-- Email: superadmin@system.com
-- Password: Admin@123
-- ===============================
INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
VALUES (
    gen_random_uuid(),
    NULL,
    'superadmin@system.com',
    '$2b$10$X3PUv9bxV4W8/sKR7/CbTegILeHCfugfiBb99m2RIQi08VWr.Vgti',
    'System Super Admin',
    'super_admin'
);

-- ===============================
-- DEMO TENANT
-- ===============================
INSERT INTO tenants (id, name, subdomain, status, subscription_plan, max_users, max_projects)
VALUES (
    gen_random_uuid(),
    'Demo Company',
    'demo',
    'active',
    'pro',
    25,
    15
);

-- ===============================
-- USERS, PROJECTS, TASKS
-- ===============================
DO $$
DECLARE
    demo_tenant_id UUID;
    admin_user_id UUID;
    user1_id UUID;
    user2_id UUID;
    project1_id UUID;
    project2_id UUID;
BEGIN
    SELECT id INTO demo_tenant_id FROM tenants WHERE subdomain = 'demo';

    -- ===============================
    -- TENANT ADMIN
    -- Email: admin@demo.com
    -- Password: Demo@123
    -- ===============================
    INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
    VALUES (
        gen_random_uuid(),
        demo_tenant_id,
        'admin@demo.com',
        '$2b$10$GOk4x6qiyl1SUCKJbE2Hee9EEtxt/uzmKZxDnAvM9c9H1N01f7Za6',
        'Demo Admin',
        'tenant_admin'
    ) RETURNING id INTO admin_user_id;

    -- ===============================
    -- REGULAR USER 1
    -- Email: user1@demo.com
    -- Password: User@123
    -- ===============================
    INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
    VALUES (
        gen_random_uuid(),
        demo_tenant_id,
        'user1@demo.com',
        '$2b$10$zjThe8W5JWD8jjsMyaxDSOAhYGFGHXwowEgbZ/D58sranFlS1iqv6',
        'Demo User One',
        'user'
    ) RETURNING id INTO user1_id;

    -- ===============================
    -- REGULAR USER 2
    -- Email: user2@demo.com
    -- Password: User@123
    -- ===============================
    INSERT INTO users (id, tenant_id, email, password_hash, full_name, role)
    VALUES (
        gen_random_uuid(),
        demo_tenant_id,
        'user2@demo.com',
        '$2b$10$zjThe8W5JWD8jjsMyaxDSOAhYGFGHXwowEgbZ/D58sranFlS1iqv6',
        'Demo User Two',
        'user'
    ) RETURNING id INTO user2_id;

    -- ===============================
    -- PROJECTS
    -- ===============================
    INSERT INTO projects (id, tenant_id, name, description, status, created_by)
    VALUES (
        gen_random_uuid(),
        demo_tenant_id,
        'Project Alpha',
        'First demo project',
        'active',
        admin_user_id
    ) RETURNING id INTO project1_id;

    INSERT INTO projects (id, tenant_id, name, description, status, created_by)
    VALUES (
        gen_random_uuid(),
        demo_tenant_id,
        'Project Beta',
        'Second demo project',
        'active',
        admin_user_id
    ) RETURNING id INTO project2_id;

    -- ===============================
    -- TASKS
    -- ===============================
    INSERT INTO tasks (id, project_id, tenant_id, title, status, priority, assigned_to)
    VALUES
        (gen_random_uuid(), project1_id, demo_tenant_id, 'Design UI', 'todo', 'high', user1_id),
        (gen_random_uuid(), project1_id, demo_tenant_id, 'Setup Backend', 'in_progress', 'medium', user2_id),
        (gen_random_uuid(), project1_id, demo_tenant_id, 'Create APIs', 'completed', 'high', admin_user_id),
        (gen_random_uuid(), project2_id, demo_tenant_id, 'Write Docs', 'todo', 'low', user1_id),
        (gen_random_uuid(), project2_id, demo_tenant_id, 'Testing', 'todo', 'medium', user2_id);
END $$;
