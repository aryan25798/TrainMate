-- ===================================================
-- TrainMate Aiven Cloud MySQL Setup
-- Target database: defaultdb
-- ===================================================

USE defaultdb;

DROP TABLE IF EXISTS notification;
DROP TABLE IF EXISTS cohort;
DROP TABLE IF EXISTS trainer;
DROP TABLE IF EXISTS users;

-- 1. USERS Table
CREATE TABLE users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('COACH', 'TRAINER', 'ADMIN') NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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
    status ENUM('PENDING', 'ASSIGNED', 'UNASSIGNED', 'ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cohort_coach FOREIGN KEY (coach_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_cohort_trainer FOREIGN KEY (assigned_trainer_id) REFERENCES trainer(trainer_id) ON DELETE SET NULL
);

-- 4. NOTIFICATION Table (Mailbox)
CREATE TABLE notification (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cohort_id BIGINT NULL,
    receiver_user_id BIGINT NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    message VARCHAR(500) NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notif_cohort FOREIGN KEY (cohort_id) REFERENCES cohort(cohort_id) ON DELETE SET NULL,
    CONSTRAINT fk_notif_receiver FOREIGN KEY (receiver_user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 5. SEED DATA

-- Insert Users (Password: password123)
INSERT INTO users (user_id, name, email, password, role) VALUES
(1, 'Amit Sharma', 'coach01@cognizant.com', 'password123', 'COACH'),
(2, 'Sneha Patel', 'coach02@cognizant.com', 'password123', 'COACH'),
(3, 'Rahul Kumar', 'trainer01@cognizant.com', 'password123', 'TRAINER'),
(4, 'Priya Sharma', 'trainer02@cognizant.com', 'password123', 'TRAINER'),
(5, 'Amit Verma', 'trainer03@cognizant.com', 'password123', 'TRAINER'),
(6, 'Admin User', 'admin01@cognizant.com', 'password123', 'ADMIN');

-- Insert Trainers
INSERT INTO trainer (trainer_id, user_id, skill_set, experience_years, available_from, available_till, current_workload, max_workload) VALUES
(1, 3, 'Java, Spring Boot, SQL', 5.0, '2026-08-01', '2026-12-31', 1, 5),
(2, 4, 'Angular, JavaScript, HTML, CSS', 4.0, '2026-08-01', '2026-12-31', 1, 5),
(3, 5, 'Spring Boot, Java, Microservices', 7.0, '2026-08-01', '2026-12-31', 0, 5);

-- Insert Cohorts
INSERT INTO cohort (cohort_id, cohort_code, service_line, stream, required_skill, trainee_count, start_date, end_date, location, coach_user_id, assigned_trainer_id, status) VALUES
(1, 'QEA26SD001', 'QEA', 'Software Development', 'Java, Spring Boot', 50, '2026-09-01', '2026-11-30', 'Chennai', 1, 1, 'ASSIGNED'),
(2, 'QEA26SD002', 'QEA', 'Web Development', 'Angular, JavaScript', 45, '2026-09-15', '2026-11-15', 'Pune', 1, 2, 'ASSIGNED'),
(3, 'QEA26SD003', 'QEA', 'Software Development', 'Golang, Kubernetes', 35, '2026-10-01', '2026-12-31', 'Bangalore', 1, NULL, 'UNASSIGNED');

-- Insert Notifications (Mail messages)
INSERT INTO notification (notification_id, cohort_id, receiver_user_id, notification_type, message) VALUES
(1, 1, 1, 'TRAINER_ASSIGNED', 'Rahul Kumar has been assigned to cohort QEA26SD001.'),
(2, 2, 1, 'TRAINER_ASSIGNED', 'Priya Sharma has been assigned to cohort QEA26SD002.'),
(3, 3, 1, 'ALLOCATION_PENDING', 'No suitable trainer is available for cohort QEA26SD003.'),
(4, 1, 3, 'COHORT_ASSIGNMENT', 'You have been assigned to lead cohort QEA26SD001.'),
(5, 2, 4, 'COHORT_ASSIGNMENT', 'You have been assigned to lead cohort QEA26SD002.'),
(6, 3, 6, 'UNASSIGNED_ALERT', 'Cohort QEA26SD003 could not find an eligible trainer and requires admin review.');
