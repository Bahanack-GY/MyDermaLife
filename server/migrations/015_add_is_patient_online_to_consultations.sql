-- migrations/015_add_is_patient_online_to_consultations.sql

ALTER TABLE consultations ADD COLUMN IF NOT EXISTS is_patient_online BOOLEAN DEFAULT false;
