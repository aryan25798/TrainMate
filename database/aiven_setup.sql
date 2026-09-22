-- ===================================================
-- TrainMate Aiven Cloud MySQL Setup Script
-- Target Database: defaultdb (Aiven Default Database)
-- Compatible with MySQL 8.0, 8.4, and Aiven Cloud Managed DB
-- ===================================================

USE defaultdb;

-- 1. Clean Teardown (Disables foreign key checks to prevent drop order conflicts)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS cohort;
DROP TABLE IF EXISTS trainer;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS flyway_schema_history;
SET FOREIGN_KEY_CHECKS = 1;

-- 2. USERS Table
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('COACH', 'TRAINER', 'ADMIN') NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. TRAINER Table
CREATE TABLE IF NOT EXISTS trainer (
    trainer_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    skill_set VARCHAR(500) NOT NULL,
    experience_years DECIMAL(4, 1) NOT NULL DEFAULT 0.0,
    available_from DATE NOT NULL,
    available_till DATE NOT NULL,
    current_workload INT NOT NULL DEFAULT 0,
    max_workload INT NOT NULL DEFAULT 5,
    CONSTRAINT fk_trainer_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_trainer_user_id (user_id),
    INDEX idx_trainer_available_dates (available_from, available_till),
    INDEX idx_trainer_workload (current_workload, max_workload),
    INDEX idx_trainer_availability_workload (available_from, available_till, current_workload, max_workload)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. COHORT Table
CREATE TABLE IF NOT EXISTS cohort (
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
    CONSTRAINT fk_cohort_trainer FOREIGN KEY (assigned_trainer_id) REFERENCES trainer(trainer_id) ON DELETE SET NULL,
    INDEX idx_cohort_coach_user_id (coach_user_id),
    INDEX idx_cohort_assigned_trainer_id (assigned_trainer_id),
    INDEX idx_cohort_status (status),
    INDEX idx_cohort_dates (start_date, end_date),
    INDEX idx_cohort_coach_status (coach_user_id, status),
    INDEX idx_cohort_trainer_status (assigned_trainer_id, status),
    INDEX idx_cohort_coach_status_dates (coach_user_id, status, start_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. NOTIFICATION Table (Mailbox)
CREATE TABLE IF NOT EXISTS notification (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cohort_id BIGINT NULL,
    receiver_user_id BIGINT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    message VARCHAR(500) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_cohort FOREIGN KEY (cohort_id) REFERENCES cohort(cohort_id) ON DELETE SET NULL,
    CONSTRAINT fk_notif_receiver FOREIGN KEY (receiver_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_notification_receiver (receiver_user_id),
    INDEX idx_notification_cohort (cohort_id),
    INDEX idx_notification_unread (receiver_user_id, is_read),
    INDEX idx_notification_date (created_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. SEED DATA

-- Seed Users (Passwords support both role presets and password123)
INSERT INTO users (user_id, name, email, password, role) VALUES
(1, 'Amit Sharma', 'coach01@cognizant.com', 'coach123', 'COACH'),
(2, 'Sneha Patel', 'coach02@cognizant.com', 'coach123', 'COACH'),
(3, 'Rahul Kumar', 'trainer01@cognizant.com', 'trainer123', 'TRAINER'),
(4, 'Priya Sharma', 'trainer02@cognizant.com', 'trainer123', 'TRAINER'),
(5, 'Amit Verma', 'trainer03@cognizant.com', 'trainer123', 'TRAINER'),
(6, 'Admin User', 'admin01@cognizant.com', 'admin123', 'ADMIN');

-- Seed Trainers
INSERT INTO trainer (trainer_id, user_id, skill_set, experience_years, available_from, available_till, current_workload, max_workload) VALUES
(1, 3, 'Java, Spring Boot, SQL', 5.0, '2026-08-01', '2026-12-31', 1, 5),
(2, 4, 'Angular, JavaScript, HTML, CSS', 4.0, '2026-08-01', '2026-12-31', 1, 5),
(3, 5, 'Spring Boot, Java, Microservices', 7.0, '2026-08-01', '2026-12-31', 0, 5);

-- Seed Cohorts
INSERT INTO cohort (cohort_id, cohort_code, service_line, stream, required_skill, trainee_count, start_date, end_date, location, coach_user_id, assigned_trainer_id, status) VALUES
(1, 'QEA26SD001', 'QEA', 'Software Development', 'Java, Spring Boot', 50, '2026-09-01', '2026-11-30', 'Chennai', 1, 1, 'ASSIGNED'),
(2, 'QEA26SD002', 'QEA', 'Web Development', 'Angular, JavaScript', 45, '2026-09-15', '2026-11-15', 'Pune', 1, 2, 'ASSIGNED'),
(3, 'QEA26SD003', 'QEA', 'Software Development', 'Golang, Kubernetes', 35, '2026-10-01', '2026-12-31', 'Bangalore', 1, NULL, 'UNASSIGNED');

-- Seed Notifications
INSERT INTO notification (notification_id, cohort_id, receiver_user_id, notification_type, message, is_read) VALUES
(1, 1, 1, 'TRAINER_ASSIGNED', 'Rahul Kumar has been assigned to cohort QEA26SD001.', false),
(2, 2, 1, 'TRAINER_ASSIGNED', 'Priya Sharma has been assigned to cohort QEA26SD002.', false),
(3, 3, 1, 'ALLOCATION_PENDING', 'No suitable trainer is available for cohort QEA26SD003.', false),
(4, 1, 3, 'COHORT_ASSIGNMENT', 'You have been assigned to lead cohort QEA26SD001.', false),
(5, 2, 4, 'COHORT_ASSIGNMENT', 'You have been assigned to lead cohort QEA26SD002.', false),
(6, 3, 6, 'UNASSIGNED_ALERT', 'Cohort QEA26SD003 could not find an eligible trainer and requires admin review.', false);

-- Verification Query
SELECT 'Aiven Cloud MySQL Schema & Seed Data Initialized Successfully' AS status;
