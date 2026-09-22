-- ===================================================
-- V2: Initial Reference & Demo Seed Data
-- Uses INSERT IGNORE for safe idempotency across migrations
-- ===================================================

-- 1. Insert Initial Users (Password: coach123 / trainer123 / admin123, also supports password123)
INSERT IGNORE INTO users (user_id, name, email, password, role) VALUES
(1, 'Amit Sharma', 'coach01@cognizant.com', 'coach123', 'COACH'),
(2, 'Sneha Patel', 'coach02@cognizant.com', 'coach123', 'COACH'),
(3, 'Rahul Kumar', 'trainer01@cognizant.com', 'trainer123', 'TRAINER'),
(4, 'Priya Sharma', 'trainer02@cognizant.com', 'trainer123', 'TRAINER'),
(5, 'Amit Verma', 'trainer03@cognizant.com', 'trainer123', 'TRAINER'),
(6, 'Admin User', 'admin01@cognizant.com', 'admin123', 'ADMIN');

-- 2. Insert Initial Trainers
INSERT IGNORE INTO trainer (trainer_id, user_id, skill_set, experience_years, available_from, available_till, current_workload, max_workload) VALUES
(1, 3, 'Java, Spring Boot, SQL', 5.0, '2026-08-01', '2026-12-31', 1, 5),
(2, 4, 'Angular, JavaScript, HTML, CSS', 4.0, '2026-08-01', '2026-12-31', 1, 5),
(3, 5, 'Spring Boot, Java, Microservices', 7.0, '2026-08-01', '2026-12-31', 0, 5);

-- 3. Insert Initial Cohorts
INSERT IGNORE INTO cohort (cohort_id, cohort_code, service_line, stream, required_skill, trainee_count, start_date, end_date, location, coach_user_id, assigned_trainer_id, status) VALUES
(1, 'QEA26SD001', 'QEA', 'Software Development', 'Java, Spring Boot', 50, '2026-09-01', '2026-11-30', 'Chennai', 1, 1, 'ASSIGNED'),
(2, 'QEA26SD002', 'QEA', 'Web Development', 'Angular, JavaScript', 45, '2026-09-15', '2026-11-15', 'Pune', 1, 2, 'ASSIGNED'),
(3, 'QEA26SD003', 'QEA', 'Software Development', 'Golang, Kubernetes', 35, '2026-10-01', '2026-12-31', 'Bangalore', 1, NULL, 'UNASSIGNED');

-- 4. Insert Initial Notifications
INSERT IGNORE INTO notification (notification_id, cohort_id, receiver_user_id, notification_type, message, is_read) VALUES
(1, 1, 1, 'TRAINER_ASSIGNED', 'Rahul Kumar has been assigned to cohort QEA26SD001.', false),
(2, 2, 1, 'TRAINER_ASSIGNED', 'Priya Sharma has been assigned to cohort QEA26SD002.', false),
(3, 3, 1, 'ALLOCATION_PENDING', 'No suitable trainer is available for cohort QEA26SD003.', false),
(4, 1, 3, 'COHORT_ASSIGNMENT', 'You have been assigned to lead cohort QEA26SD001.', false),
(5, 2, 4, 'COHORT_ASSIGNMENT', 'You have been assigned to lead cohort QEA26SD002.', false),
(6, 3, 6, 'UNASSIGNED_ALERT', 'Cohort QEA26SD003 could not find an eligible trainer and requires admin review.', false);
