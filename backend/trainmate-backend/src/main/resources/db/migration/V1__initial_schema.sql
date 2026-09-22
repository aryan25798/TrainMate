-- ===================================================
-- TrainMate Database Schema (4 Core Tables)
-- Initial migration with indexes
-- ===================================================

-- 1. USERS Table
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('COACH', 'TRAINER', 'ADMIN') NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. TRAINER Table
CREATE TABLE trainer (
    trainer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    skill_set VARCHAR(500) NOT NULL,
    experience_years DECIMAL(4, 1) NOT NULL DEFAULT 0.0,
    available_from DATE NOT NULL,
    available_till DATE NOT NULL,
    current_workload INT NOT NULL DEFAULT 0,
    max_workload INT NOT NULL DEFAULT 5,
    CONSTRAINT fk_trainer_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_trainer_user_id ON trainer(user_id);
CREATE INDEX idx_trainer_available_dates ON trainer(available_from, available_till);
CREATE INDEX idx_trainer_workload ON trainer(current_workload, max_workload);

-- 3. COHORT Table
CREATE TABLE cohort (
    cohort_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cohort_code VARCHAR(30) NOT NULL UNIQUE,
    service_line VARCHAR(100) NOT NULL,
    stream VARCHAR(100) NOT NULL,
    required_skill VARCHAR(300) NOT NULL,
    trainee_count INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    location VARCHAR(100) NOT NULL,
    coach_user_id BIGINT NOT NULL,
    assigned_trainer_id BIGINT NULL,
    status ENUM('PENDING', 'PROCESSING', 'ASSIGNED', 'UNASSIGNED', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cohort_coach FOREIGN KEY (coach_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_cohort_trainer FOREIGN KEY (assigned_trainer_id) REFERENCES trainer(trainer_id) ON DELETE SET NULL
);

CREATE INDEX idx_cohort_coach_user_id ON cohort(coach_user_id);
CREATE INDEX idx_cohort_assigned_trainer_id ON cohort(assigned_trainer_id);
CREATE INDEX idx_cohort_status ON cohort(status);
CREATE INDEX idx_cohort_dates ON cohort(start_date, end_date);
CREATE INDEX idx_cohort_coach_status ON cohort(coach_user_id, status);
CREATE INDEX idx_cohort_trainer_status ON cohort(assigned_trainer_id, status);

-- 4. NOTIFICATION Table (Mailbox)
CREATE TABLE notification (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cohort_id BIGINT NULL,
    receiver_user_id BIGINT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_cohort FOREIGN KEY (cohort_id) REFERENCES cohort(cohort_id) ON DELETE SET NULL,
    CONSTRAINT fk_notif_receiver FOREIGN KEY (receiver_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_notification_receiver ON notification(receiver_user_id);
CREATE INDEX idx_notification_cohort ON notification(cohort_id);
CREATE INDEX idx_notification_unread ON notification(receiver_user_id, is_read);
CREATE INDEX idx_notification_date ON notification(created_date);