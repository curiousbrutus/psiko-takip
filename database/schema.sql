-- =====================================================
-- Psikotakip Oracle Database Schema (PSK_EBG prefix)
-- Mental Health Tracking System
-- =====================================================
-- HIPAA/KVKK compliant with audit trails
-- All tables use PSK_EBG_ prefix to isolate DB objects
-- =====================================================

-- 1. USERS TABLE
CREATE TABLE psk_ebg_users (
    user_id VARCHAR2(128) PRIMARY KEY,
    email VARCHAR2(255) UNIQUE NOT NULL,
    password_hash VARCHAR2(255) NOT NULL,
    display_name VARCHAR2(255),
    role VARCHAR2(50) NOT NULL CHECK (role IN ('danisan', 'terapist', 'kurum_yoneticisi')),
    connected_therapist_id VARCHAR2(128),
    phone VARCHAR2(20),
    status VARCHAR2(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    CONSTRAINT fk_therapist FOREIGN KEY (connected_therapist_id) REFERENCES psk_ebg_users(user_id)
);

CREATE INDEX idx_psk_users_email ON psk_ebg_users(email);
CREATE INDEX idx_psk_users_role ON psk_ebg_users(role);
CREATE INDEX idx_psk_users_therapist ON psk_ebg_users(connected_therapist_id);

-- 2. USER SESSIONS TABLE (for JWT refresh tokens)
CREATE TABLE psk_ebg_user_sessions (
    session_id VARCHAR2(128) PRIMARY KEY,
    user_id VARCHAR2(128) NOT NULL,
    refresh_token VARCHAR2(500) NOT NULL,
    ip_address VARCHAR2(45),
    user_agent VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active NUMBER(1) DEFAULT 1,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES psk_ebg_users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_psk_sessions_user ON psk_ebg_user_sessions(user_id);
CREATE INDEX idx_psk_sessions_token ON psk_ebg_user_sessions(refresh_token);

-- 3. GAMIFICATION DATA
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

-- 4. MOOD ENTRIES
CREATE TABLE psk_ebg_mood_entries (
    entry_id VARCHAR2(128) PRIMARY KEY,
    user_id VARCHAR2(128) NOT NULL,
    mood VARCHAR2(50) NOT NULL,
    period VARCHAR2(20) CHECK (period IN ('morning', 'evening')),
    intensity NUMBER CHECK (intensity BETWEEN 1 AND 5),
    notes CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mood_user FOREIGN KEY (user_id) REFERENCES psk_ebg_users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_psk_mood_user ON psk_ebg_mood_entries(user_id);
CREATE INDEX idx_psk_mood_created ON psk_ebg_mood_entries(created_at);

-- 5. JOURNAL ENTRIES
CREATE TABLE psk_ebg_journal_entries (
    entry_id VARCHAR2(128) PRIMARY KEY,
    user_id VARCHAR2(128) NOT NULL,
    content CLOB NOT NULL,
    prompt VARCHAR2(500),
    entry_type VARCHAR2(50),
    is_shared NUMBER(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_journal_user FOREIGN KEY (user_id) REFERENCES psk_ebg_users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_psk_journal_user ON psk_ebg_journal_entries(user_id);
CREATE INDEX idx_psk_journal_shared ON psk_ebg_journal_entries(is_shared);
CREATE INDEX idx_psk_journal_created ON psk_ebg_journal_entries(created_at);

-- 6. TEST SUBMISSIONS
CREATE TABLE psk_ebg_test_submissions (
    submission_id VARCHAR2(128) PRIMARY KEY,
    user_id VARCHAR2(128) NOT NULL,
    therapist_id VARCHAR2(128),
    test_name VARCHAR2(100) NOT NULL,
    total_score NUMBER,
    answers CLOB,
    analysis CLOB,
    severity_level VARCHAR2(50),
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_test_user FOREIGN KEY (user_id) REFERENCES psk_ebg_users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_test_therapist FOREIGN KEY (therapist_id) REFERENCES psk_ebg_users(user_id)
);

CREATE INDEX idx_psk_test_user ON psk_ebg_test_submissions(user_id);
CREATE INDEX idx_psk_test_therapist ON psk_ebg_test_submissions(therapist_id);
CREATE INDEX idx_psk_test_name ON psk_ebg_test_submissions(test_name);
CREATE INDEX idx_psk_test_submitted ON psk_ebg_test_submissions(submitted_at);

-- 7. ASSESSMENT TASKS
CREATE TABLE psk_ebg_assessment_tasks (
    task_id VARCHAR2(128) PRIMARY KEY,
    client_id VARCHAR2(128) NOT NULL,
    therapist_id VARCHAR2(128) NOT NULL,
    test_name VARCHAR2(100) NOT NULL,
    status VARCHAR2(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP,
    notes CLOB,
    CONSTRAINT fk_assessment_client FOREIGN KEY (client_id) REFERENCES psk_ebg_users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_assessment_therapist FOREIGN KEY (therapist_id) REFERENCES psk_ebg_users(user_id)
);

CREATE INDEX idx_psk_assessment_client ON psk_ebg_assessment_tasks(client_id);
CREATE INDEX idx_psk_assessment_therapist ON psk_ebg_assessment_tasks(therapist_id);
CREATE INDEX idx_psk_assessment_status ON psk_ebg_assessment_tasks(status);

-- 8. ASSESSMENT RESULTS
CREATE TABLE psk_ebg_assessment_results (
    result_id VARCHAR2(128) PRIMARY KEY,
    task_id VARCHAR2(128) NOT NULL,
    user_id VARCHAR2(128) NOT NULL,
    therapist_id VARCHAR2(128) NOT NULL,
    test_name VARCHAR2(100) NOT NULL,
    score NUMBER,
    alliance_score NUMBER,
    answers CLOB,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_result_task FOREIGN KEY (task_id) REFERENCES psk_ebg_assessment_tasks(task_id) ON DELETE CASCADE,
    CONSTRAINT fk_result_user FOREIGN KEY (user_id) REFERENCES psk_ebg_users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_result_therapist FOREIGN KEY (therapist_id) REFERENCES psk_ebg_users(user_id)
);

CREATE INDEX idx_psk_result_task ON psk_ebg_assessment_results(task_id);
CREATE INDEX idx_psk_result_user ON psk_ebg_assessment_results(user_id);
CREATE INDEX idx_psk_result_therapist ON psk_ebg_assessment_results(therapist_id);

-- 9. COLLABORATIVE TASKS
CREATE TABLE psk_ebg_collaborative_tasks (
    task_id VARCHAR2(128) PRIMARY KEY,
    client_id VARCHAR2(128) NOT NULL,
    therapist_id VARCHAR2(128) NOT NULL,
    title VARCHAR2(500) NOT NULL,
    description CLOB,
    task_type VARCHAR2(100),
    status VARCHAR2(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
    fields CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT fk_collab_client FOREIGN KEY (client_id) REFERENCES psk_ebg_users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_collab_therapist FOREIGN KEY (therapist_id) REFERENCES psk_ebg_users(user_id)
);

CREATE INDEX idx_psk_collab_client ON psk_ebg_collaborative_tasks(client_id);
CREATE INDEX idx_psk_collab_therapist ON psk_ebg_collaborative_tasks(therapist_id);
CREATE INDEX idx_psk_collab_status ON psk_ebg_collaborative_tasks(status);

-- 10. APPOINTMENTS
CREATE TABLE psk_ebg_appointments (
    appointment_id VARCHAR2(128) PRIMARY KEY,
    client_id VARCHAR2(128) NOT NULL,
    therapist_id VARCHAR2(128) NOT NULL,
    appointment_date TIMESTAMP NOT NULL,
    appointment_type VARCHAR2(50) CHECK (appointment_type IN ('Online', 'Yuz Yuze')),
    duration_minutes NUMBER DEFAULT 50,
    status VARCHAR2(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
    description CLOB,
    notes CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appointment_client FOREIGN KEY (client_id) REFERENCES psk_ebg_users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_appointment_therapist FOREIGN KEY (therapist_id) REFERENCES psk_ebg_users(user_id)
);

CREATE INDEX idx_psk_appointment_client ON psk_ebg_appointments(client_id);
CREATE INDEX idx_psk_appointment_therapist ON psk_ebg_appointments(therapist_id);
CREATE INDEX idx_psk_appointment_date ON psk_ebg_appointments(appointment_date);
CREATE INDEX idx_psk_appointment_status ON psk_ebg_appointments(status);

-- 11. CHAT MESSAGES (Therapeutic Assistant)
CREATE TABLE psk_ebg_chat_messages (
    message_id VARCHAR2(128) PRIMARY KEY,
    user_id VARCHAR2(128) NOT NULL,
    role VARCHAR2(20) CHECK (role IN ('user', 'assistant', 'system')),
    content CLOB NOT NULL,
    is_crisis NUMBER(1) DEFAULT 0,
    metadata CLOB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_chat_user FOREIGN KEY (user_id) REFERENCES psk_ebg_users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_psk_chat_user ON psk_ebg_chat_messages(user_id);
CREATE INDEX idx_psk_chat_created ON psk_ebg_chat_messages(created_at);
CREATE INDEX idx_psk_chat_crisis ON psk_ebg_chat_messages(is_crisis);

-- 12. AUDIT LOG (HIPAA/KVKK Compliance)
CREATE TABLE psk_ebg_audit_log (
    audit_id VARCHAR2(128) PRIMARY KEY,
    user_id VARCHAR2(128),
    action VARCHAR2(100) NOT NULL,
    table_name VARCHAR2(100),
    record_id VARCHAR2(128),
    old_values CLOB,
    new_values CLOB,
    ip_address VARCHAR2(45),
    user_agent VARCHAR2(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES psk_ebg_users(user_id)
);

CREATE INDEX idx_psk_audit_user ON psk_ebg_audit_log(user_id);
CREATE INDEX idx_psk_audit_table ON psk_ebg_audit_log(table_name);
CREATE INDEX idx_psk_audit_created ON psk_ebg_audit_log(created_at);

-- 13. SYSTEM CONFIGURATION
CREATE TABLE psk_ebg_system_config (
    config_key VARCHAR2(100) PRIMARY KEY,
    config_value CLOB,
    description VARCHAR2(500),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR2(128)
);

-- TRIGGERS FOR AUTOMATIC TIMESTAMP UPDATES
CREATE OR REPLACE TRIGGER trg_psk_users_update
BEFORE UPDATE ON psk_ebg_users
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_psk_journal_update
BEFORE UPDATE ON psk_ebg_journal_entries
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_psk_collab_update
BEFORE UPDATE ON psk_ebg_collaborative_tasks
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_psk_appointment_update
BEFORE UPDATE ON psk_ebg_appointments
FOR EACH ROW
BEGIN
    :NEW.updated_at := CURRENT_TIMESTAMP;
END;
/

-- SEQUENCES
CREATE SEQUENCE seq_users START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_sessions START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_moods START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_journals START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_tests START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_assessments START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_results START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_tasks START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_appointments START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_messages START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_audit START WITH 1 INCREMENT BY 1;

COMMIT;
