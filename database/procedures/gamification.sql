-- =====================================================
-- Gamification Stored Procedures (PSK_EBG prefix)
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
    -- Get current stats
    SELECT xp, user_level, current_streak, last_activity_date 
    INTO v_current_xp, v_current_level, v_current_streak, v_last_activity
    FROM psk_ebg_gamification
    WHERE user_id = p_user_id;
    
    -- Add XP
    v_current_xp := v_current_xp + p_xp_amount;
    
    -- Calculate new level (100 XP per level)
    v_new_level := FLOOR(v_current_xp / 100) + 1;
    
    -- Update streak
    IF v_last_activity IS NULL OR 
       TRUNC(v_last_activity) < TRUNC(CURRENT_TIMESTAMP) THEN
        -- New day, increment streak
        v_current_streak := v_current_streak + 1;
    END IF;
    
    -- Update gamification
    UPDATE psk_ebg_gamification
    SET xp = v_current_xp,
        user_level = v_new_level,
        current_streak = v_current_streak,
        longest_streak = GREATEST(longest_streak, v_current_streak),
        last_activity_date = CURRENT_TIMESTAMP,
        total_tasks_completed = total_tasks_completed + 1
    WHERE user_id = p_user_id;
    
    -- Log the action
    INSERT INTO psk_ebg_audit_log (
        audit_id, user_id, action, table_name, record_id, new_values
    ) VALUES (
        'AUD_' || seq_audit.NEXTVAL,
        p_user_id,
        'ADD_XP',
        'psk_ebg_gamification',
        p_user_id,
        '{"xp_added":' || p_xp_amount || ',"new_level":' || v_new_level || ',"activity_type":"' || p_activity_type || '"}'
    );
    
    COMMIT;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        -- Initialize gamification if not exists
        INSERT INTO psk_ebg_gamification (user_id, xp, user_level, current_streak)
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
    UPDATE psk_ebg_gamification
    SET companion_type = p_companion_type,
        companion_created_at = CURRENT_TIMESTAMP
    WHERE user_id = p_user_id;
    
    -- Log the action
    INSERT INTO psk_ebg_audit_log (
        audit_id, user_id, action, table_name, record_id, new_values
    ) VALUES (
        'AUD_' || seq_audit.NEXTVAL,
        p_user_id,
        'SET_COMPANION',
        'psk_ebg_gamification',
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
            -- Calculate XP for next level
            (user_level * 100) - xp as xp_to_next_level
        FROM psk_ebg_gamification
        WHERE user_id = p_user_id;
END;
/

-- Procedure to reset daily streak
CREATE OR REPLACE PROCEDURE sp_reset_streak (
    p_user_id IN VARCHAR2
) AS
BEGIN
    UPDATE psk_ebg_gamification
    SET current_streak = 0
    WHERE user_id = p_user_id;
    
    COMMIT;
END;
/
