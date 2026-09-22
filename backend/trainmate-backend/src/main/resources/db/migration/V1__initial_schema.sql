-- ===================================================
-- V1: TrainMate Core Database Schema
-- Compatible with MySQL 8.0+, Aiven Cloud MySQL, and Docker
-- Fully idempotent with inline composite indexes
-- ===================================================

-- 1. USERS Table
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

-- 2. TRAINER Table
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

-- 3. COHORT Table
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

-- 4. NOTIFICATION Table (Mailbox)
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