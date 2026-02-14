SET DEFINE OFF
SET SERVEROUTPUT ON

-- =====================================================
-- User Management Stored Procedures (Oracle 12.1 compatible)
-- =====================================================

-- Procedure to create a new user with hashed password
CREATE OR REPLACE PROCEDURE sp_create_user (
    p_email IN VARCHAR2,
    p_password_hash IN VARCHAR2,
    p_display_name IN VARCHAR2,
    p_role IN VARCHAR2,
    p_user_id OUT VARCHAR2
) AS
BEGIN
    p_user_id := 'USR_' || seq_users.NEXTVAL || '_' || TO_CHAR(SYSTIMESTAMP, 'YYYYMMDDHH24MISS');

    INSERT INTO users (user_id, email, password_hash, display_name, role)
    VALUES (p_user_id, p_email, p_password_hash, p_display_name, p_role);

    -- Initialize gamification for client
    IF p_role = 'danisan' THEN
        INSERT INTO gamification (user_id, xp, user_level, current_streak)
        VALUES (p_user_id, 0, 1, 0);
    END IF;

    -- Log the action
    INSERT INTO audit_log (
        audit_id, user_id, action, table_name, record_id, new_values
    ) VALUES (
        'AUD_' || seq_audit.NEXTVAL,
        p_user_id,
        'CREATE_USER',
        'users',
        p_user_id,
        '{"email":"' || p_email || '","role":"' || p_role || '"}'
    );

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Procedure to authenticate user
CREATE OR REPLACE PROCEDURE sp_authenticate_user (
    p_email IN VARCHAR2,
    p_user_id OUT VARCHAR2,
    p_password_hash OUT VARCHAR2,
    p_display_name OUT VARCHAR2,
    p_role OUT VARCHAR2,
    p_status OUT VARCHAR2
) AS
BEGIN
    SELECT user_id, password_hash, display_name, role, status
    INTO p_user_id, p_password_hash, p_display_name, p_role, p_status
    FROM users
    WHERE email = p_email AND status = 'active';

    UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = p_user_id;
    COMMIT;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        p_user_id := NULL;
        p_password_hash := NULL;
        p_display_name := NULL;
        p_role := NULL;
        p_status := NULL;
END;
/

-- Procedure to create user session
CREATE OR REPLACE PROCEDURE sp_create_session (
    p_user_id IN VARCHAR2,
    p_refresh_token IN VARCHAR2,
    p_ip_address IN VARCHAR2,
    p_user_agent IN VARCHAR2,
    p_expires_at IN TIMESTAMP,
    p_session_id OUT VARCHAR2
) AS
BEGIN
    p_session_id := 'SES_' || seq_sessions.NEXTVAL || '_' || TO_CHAR(SYSTIMESTAMP, 'YYYYMMDDHH24MISS');

    INSERT INTO user_sessions (
        session_id, user_id, refresh_token, ip_address, user_agent, expires_at
    ) VALUES (
        p_session_id, p_user_id, p_refresh_token, p_ip_address, p_user_agent, p_expires_at
    );

    COMMIT;
END;
/

-- Procedure to invalidate session
CREATE OR REPLACE PROCEDURE sp_invalidate_session (
    p_session_id IN VARCHAR2
) AS
BEGIN
    UPDATE user_sessions
    SET is_active = 0
    WHERE session_id = p_session_id;

    COMMIT;
END;
/

-- Procedure to connect client to therapist
CREATE OR REPLACE PROCEDURE sp_connect_client_therapist (
    p_client_id IN VARCHAR2,
    p_therapist_id IN VARCHAR2
) AS
    v_therapist_role VARCHAR2(50);
BEGIN
    SELECT role INTO v_therapist_role FROM users WHERE user_id = p_therapist_id;

    IF v_therapist_role != 'terapist' THEN
        RAISE_APPLICATION_ERROR(-20001, 'User is not a therapist');
    END IF;

    UPDATE users
    SET connected_therapist_id = p_therapist_id
    WHERE user_id = p_client_id;

    INSERT INTO audit_log (
        audit_id, user_id, action, table_name, record_id, new_values
    ) VALUES (
        'AUD_' || seq_audit.NEXTVAL,
        p_client_id,
        'CONNECT_THERAPIST',
        'users',
        p_client_id,
        '{"therapist_id":"' || p_therapist_id || '"}'
    );

    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20002, 'Therapist not found');
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Procedure to get user profile
CREATE OR REPLACE PROCEDURE sp_get_user_profile (
    p_user_id IN VARCHAR2,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT
            u.user_id, u.email, u.display_name, u.role, u.phone,
            u.status, u.created_at, u.last_login, u.connected_therapist_id,
            t.display_name as therapist_name, t.email as therapist_email
        FROM users u
        LEFT JOIN users t ON u.connected_therapist_id = t.user_id
        WHERE u.user_id = p_user_id;
END;
/

-- Procedure to update user profile
CREATE OR REPLACE PROCEDURE sp_update_user_profile (
    p_user_id IN VARCHAR2,
    p_display_name IN VARCHAR2,
    p_phone IN VARCHAR2
) AS
BEGIN
    UPDATE users
    SET display_name = p_display_name,
        phone = p_phone
    WHERE user_id = p_user_id;

    INSERT INTO audit_log (
        audit_id, user_id, action, table_name, record_id
    ) VALUES (
        'AUD_' || seq_audit.NEXTVAL,
        p_user_id,
        'UPDATE_PROFILE',
        'users',
        p_user_id
    );

    COMMIT;
END;
/

-- Procedure to change password
CREATE OR REPLACE PROCEDURE sp_change_password (
    p_user_id IN VARCHAR2,
    p_new_password_hash IN VARCHAR2
) AS
BEGIN
    UPDATE users
    SET password_hash = p_new_password_hash
    WHERE user_id = p_user_id;

    UPDATE user_sessions
    SET is_active = 0
    WHERE user_id = p_user_id;

    INSERT INTO audit_log (
        audit_id, user_id, action, table_name, record_id
    ) VALUES (
        'AUD_' || seq_audit.NEXTVAL,
        p_user_id,
        'CHANGE_PASSWORD',
        'users',
        p_user_id
    );

    COMMIT;
END;
/

PROMPT User management procedures created successfully!

-- =====================================================
-- Gamification Stored Procedures (Oracle 12.1 compatible)
-- =====================================================

-- Procedure to add XP and update level
CREATE OR REPLACE PROCEDURE sp_add_xp (
    p_user_id IN VARCHAR2,
    p_xp_amount IN NUMBER,
    p_activity_type IN VARCHAR2 DEFAULT 'task_completion'
) AS
    v_current_xp NUMBER;
    v_current_level NUMBER;
    v_new_level NUMBER;
    v_current_streak NUMBER;
    v_last_activity TIMESTAMP;
BEGIN
    SELECT xp, user_level, current_streak, last_activity_date
    INTO v_current_xp, v_current_level, v_current_streak, v_last_activity
    FROM gamification
    WHERE user_id = p_user_id;

    v_current_xp := v_current_xp + p_xp_amount;
    v_new_level := FLOOR(v_current_xp / 100) + 1;

    IF v_last_activity IS NULL OR
       TRUNC(v_last_activity) < TRUNC(CURRENT_TIMESTAMP) THEN
        v_current_streak := v_current_streak + 1;
    END IF;

    UPDATE gamification
    SET xp = v_current_xp,
        user_level = v_new_level,
        current_streak = v_current_streak,
        longest_streak = GREATEST(longest_streak, v_current_streak),
        last_activity_date = CURRENT_TIMESTAMP,
        total_tasks_completed = total_tasks_completed + 1
    WHERE user_id = p_user_id;

    INSERT INTO audit_log (
        audit_id, user_id, action, table_name, record_id, new_values
    ) VALUES (
        'AUD_' || seq_audit.NEXTVAL,
        p_user_id,
        'ADD_XP',
        'gamification',
        p_user_id,
        '{"xp_added":' || p_xp_amount || ',"new_level":' || v_new_level || ',"activity_type":"' || p_activity_type || '"}'
    );

    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        INSERT INTO gamification (user_id, xp, user_level, current_streak)
        VALUES (p_user_id, p_xp_amount, 1, 1);
        COMMIT;
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-- Procedure to set companion
CREATE OR REPLACE PROCEDURE sp_set_companion (
    p_user_id IN VARCHAR2,
    p_companion_type IN VARCHAR2
) AS
BEGIN
    UPDATE gamification
    SET companion_type = p_companion_type,
        companion_created_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;

    INSERT INTO audit_log (
        audit_id, user_id, action, table_name, record_id, new_values
    ) VALUES (
        'AUD_' || seq_audit.NEXTVAL,
        p_user_id,
        'SET_COMPANION',
        'gamification',
        p_user_id,
        '{"companion_type":"' || p_companion_type || '"}'
    );

    COMMIT;
END;
/

-- Procedure to get gamification data
CREATE OR REPLACE PROCEDURE sp_get_gamification (
    p_user_id IN VARCHAR2,
    p_cursor OUT SYS_REFCURSOR
) AS
BEGIN
    OPEN p_cursor FOR
        SELECT
            user_id, xp, user_level, current_streak, longest_streak,
            companion_type, companion_created_at, last_activity_date,
            total_tasks_completed,
            (user_level * 100) - xp as xp_to_next_level
        FROM gamification
        WHERE user_id = p_user_id;
END;
/

-- Procedure to reset daily streak
CREATE OR REPLACE PROCEDURE sp_reset_streak (
    p_user_id IN VARCHAR2
) AS
BEGIN
    UPDATE gamification
    SET current_streak = 0
    WHERE user_id = p_user_id;

    COMMIT;
END;
/

PROMPT All stored procedures created successfully!
EXIT;
