-- Add transcription fields to consultations table
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS transcription TEXT;
ALTER TABLE consultations ADD COLUMN IF NOT EXISTS transcription_status VARCHAR(50) DEFAULT 'pending';
