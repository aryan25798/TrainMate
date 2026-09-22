-- ===================================================
-- V2: Add composite indexes for high-throughput queries
-- Fully idempotent and compatible with all MySQL versions
-- ===================================================

DROP PROCEDURE IF EXISTS AddTrainMateV2Indexes;
DELIMITER $$
CREATE PROCEDURE AddTrainMateV2Indexes()
BEGIN
    -- Add is_read to notification if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = DATABASE() AND table_name = 'notification' AND column_name = 'is_read'
    ) THEN
        ALTER TABLE notification ADD COLUMN is_read BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;

    -- Add idx_cohort_coach_status_dates if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics 
        WHERE table_schema = DATABASE() AND table_name = 'cohort' AND index_name = 'idx_cohort_coach_status_dates'
    ) THEN
        CREATE INDEX idx_cohort_coach_status_dates ON cohort(coach_user_id, status, start_date);
    END IF;

    -- Add idx_trainer_availability_workload if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.statistics 
        WHERE table_schema = DATABASE() AND table_name = 'trainer' AND index_name = 'idx_trainer_availability_workload'
    ) THEN
        CREATE INDEX idx_trainer_availability_workload ON trainer(available_from, available_till, current_workload, max_workload);
    END IF;
END$$
DELIMITER ;

CALL AddTrainMateV2Indexes();
DROP PROCEDURE IF EXISTS AddTrainMateV2Indexes;