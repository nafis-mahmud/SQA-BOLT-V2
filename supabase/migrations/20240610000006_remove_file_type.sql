-- Remove file_type column from datasets table
ALTER TABLE IF EXISTS datasets
DROP COLUMN IF EXISTS file_type;
