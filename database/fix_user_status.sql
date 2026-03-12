-- Fix User Status for Test Users (PSK_EBG prefix)
-- Run this to activate the test user accounts

-- Update all test users to active status
UPDATE psk_ebg_users 
SET status = 'active' 
WHERE email LIKE '%@test.psikotakip.com' 
AND (status IS NULL OR status != 'active');

COMMIT;

-- Verify the update
SELECT user_id, email, display_name, role, status 
FROM psk_ebg_users 
WHERE email LIKE '%@test.psikotakip.com'
ORDER BY role, user_id;
