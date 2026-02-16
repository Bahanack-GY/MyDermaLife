-- migrations/004_patients.sql

-- Patient medical history
CREATE TABLE patient_medical_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    allergies JSONB,
    current_medications JSONB,
    past_conditions JSONB,
    family_history JSONB,
    skin_type VARCHAR(50),
    skin_concerns JSONB,
    blood_type VARCHAR(10),
    chronic_conditions JSONB,
    surgeries JSONB,
    last_updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT patient_medical_history_skin_type_check CHECK (skin_type IN ('normal', 'dry', 'oily', 'combination', 'sensitive'))
);

CREATE INDEX idx_patient_medical_history_patient_id ON patient_medical_history(patient_id);

CREATE TRIGGER update_patient_medical_history_updated_at BEFORE UPDATE ON patient_medical_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
