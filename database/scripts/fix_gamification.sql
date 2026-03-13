SET DEFINE OFF

-- Fix gamification table - "level" is reserved in Oracle 12.1
CREATE TABLE psk_ebg_gamification (
    user_id VARCHAR2(128) PRIMARY KEY,
    xp NUMBER DEFAULT 0,
    user_level NUMBER DEFAULT 1,
    current_streak NUMBER DEFAULT 0,
    longest_streak NUMBER DEFAULT 0,
    companion_type VARCHAR2(50),
    companion_created_at TIMESTAMP,
    last_activity_date TIMESTAMP,
    total_tasks_completed NUMBER DEFAULT 0,
    CONSTRAINT fk_gamification_user FOREIGN KEY (user_id) REFERENCES psk_ebg_users(user_id) ON DELETE CASCADE
);

COMMIT;
PROMPT Gamification table created successfully!
EXIT;
