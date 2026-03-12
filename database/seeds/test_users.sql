-- =====================================================
-- Test Users Seed Data (PSK_EBG prefix)
-- Password for all users: Test123!
-- =====================================================

-- Clean up existing test users (optional)
-- DELETE FROM psk_ebg_users WHERE email LIKE '%@test.psikotakip.com';

-- 1. ADMIN USER (kurum_yoneticisi)
INSERT INTO psk_ebg_users (
    user_id, 
    email, 
    password_hash, 
    display_name, 
    role, 
    status
) VALUES (
    'USR_ADMIN_001',
    'admin@test.psikotakip.com',
    '$2a$10$YourHashedPasswordHereForAdmin',
    'Test Admin',
    'kurum_yoneticisi',
    'active'
);

-- 2. THERAPIST USER (terapist)
INSERT INTO psk_ebg_users (
    user_id, 
    email, 
    password_hash, 
    display_name, 
    role, 
    status
) VALUES (
    'USR_THERAPIST_001',
    'therapist@test.psikotakip.com',
    '$2a$10$YourHashedPasswordHereForTherapist',
    'Dr. Test Terapist',
    'terapist',
    'active'
);

-- 3. CLIENT USER (danisan)
INSERT INTO psk_ebg_users (
    user_id, 
    email, 
    password_hash, 
    display_name, 
    role, 
    connected_therapist_id,
    status
) VALUES (
    'USR_CLIENT_001',
    'client@test.psikotakip.com',
    '$2a$10$YourHashedPasswordHereForClient',
    'Test Danışan',
    'danisan',
    'USR_THERAPIST_001',
    'active'
);

-- 4. Additional CLIENT USER (not connected to therapist)
INSERT INTO psk_ebg_users (
    user_id, 
    email, 
    password_hash, 
    display_name, 
    role, 
    status
) VALUES (
    'USR_CLIENT_002',
    'client2@test.psikotakip.com',
    '$2a$10$YourHashedPasswordHereForClient2',
    'Test Danışan 2',
    'danisan',
    'active'
);

COMMIT;

-- Verify users created
SELECT user_id, email, display_name, role, status 
FROM psk_ebg_users 
WHERE email LIKE '%@test.psikotakip.com'
ORDER BY role, user_id;
