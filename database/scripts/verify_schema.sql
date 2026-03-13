SET PAGESIZE 100
SET LINESIZE 200
PROMPT === Tables ===
SELECT table_name FROM user_tables WHERE table_name IN ('USERS','USER_SESSIONS','GAMIFICATION','MOOD_ENTRIES','JOURNAL_ENTRIES','TEST_SUBMISSIONS','ASSESSMENT_TASKS','ASSESSMENT_RESULTS','COLLABORATIVE_TASKS','APPOINTMENTS','CHAT_MESSAGES','AUDIT_LOG','SYSTEM_CONFIG') ORDER BY table_name;
PROMPT === Sequences ===
SELECT sequence_name FROM user_sequences ORDER BY sequence_name;
PROMPT === Procedures ===
SELECT object_name, status FROM user_objects WHERE object_type = 'PROCEDURE' ORDER BY object_name;
PROMPT === Triggers ===
SELECT trigger_name, status FROM user_triggers ORDER BY trigger_name;
EXIT;
