-- =====================================================
-- User Management Stored Procedures
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
    
    INSERT INTO psk_ebg_users (user_id, email, password_hash, display_name, role, status)
    VALUES (p_user_id, p_email, p_password_hash, p_display_name, p_role, 'active');
    
    -- Initialize gamification for client
    IF p_role = 'danisan' THEN
        INSERT INTO psk_ebg_gamification (user_id, xp, level, current_streak)
        VALUES (p_user_id, 0, 1, 0);
    END IF;
    
    -- Log the action
    INSERT INTO psk_ebg_audit_log (
        audit_id, 
        user_id, 
        action, 
        table_name, 
        record_id,
        new_values
    ) VALUES (
        'AUD_' || seq_audit.NEXTVAL,
        p_user_id,
        'CREATE_USER',
        'users',
        p_user_id,
        JSON_OBJECT('email' VALUE p_email, 'role' VALUE p_role)
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
    FROM psk_ebg_users
    WHERE email = p_email AND status = 'active';
    
    -- Update last login
    UPDATE psk_ebg_users SET last_login = CURRENT_TIMESTAMP WHERE user_id = p_user_id;
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
    
    INSERT INTO psk_ebg_user_sessions (
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
    UPDATE psk_ebg_user_sessions
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
    -- Verify therapist role
    SELECT role INTO v_therapist_role FROM psk_ebg_users WHERE user_id = p_therapist_id;
    
    IF v_therapist_role != 'terapist' THEN
        RAISE_APPLICATION_ERROR(-20001, 'User is not a therapist');
    END IF;
    
    -- Connect client to therapist
    UPDATE psk_ebg_users
    SET connected_therapist_id = p_therapist_id
    WHERE user_id = p_client_id;
    
    -- Log the action
    INSERT INTO psk_ebg_audit_log (
        audit_id, user_id, action, table_name, record_id,
        new_values
    ) VALUES (
        'AUD_' || seq_audit.NEXTVAL,
        p_client_id,
        'CONNECT_THERAPIST',
        'users',
        p_client_id,
        JSON_OBJECT('therapist_id' VALUE p_therapist_id)
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
        FROM psk_ebg_users u
        LEFT JOIN psk_ebg_users t ON u.connected_therapist_id = t.user_id
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
    UPDATE psk_ebg_users
    SET display_name = p_display_name,
        phone = p_phone
    WHERE user_id = p_user_id;
    
    -- Log the action
    INSERT INTO psk_ebg_audit_log (
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
    UPDATE psk_ebg_users
    SET password_hash = p_new_password_hash
    WHERE user_id = p_user_id;
    
    -- Invalidate all existing sessions
    UPDATE psk_ebg_user_sessions
    SET is_active = 0
    WHERE user_id = p_user_id;
    
    -- Log the action
    INSERT INTO psk_ebg_audit_log (
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

