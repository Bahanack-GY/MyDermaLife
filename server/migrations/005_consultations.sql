-- migrations/005_consultations.sql

-- Consultations
CREATE TABLE consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_number VARCHAR(50) UNIQUE NOT NULL DEFAULT generate_consultation_number(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    consultation_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    scheduled_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER,
    actual_start_time TIMESTAMP,
    actual_end_time TIMESTAMP,
    chief_complaint TEXT,
    symptoms JSONB,
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    video_call_url VARCHAR(500),
    video_recording_url VARCHAR(500),
    fee DECIMAL(10,2),
    payment_status VARCHAR(50) DEFAULT 'pending',
    cancelled_by UUID REFERENCES users(id),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    rating INTEGER,
    review TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT consultations_type_check CHECK (consultation_type IN ('video', 'chat', 'in_person')),
    CONSTRAINT consultations_status_check CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show')),
    CONSTRAINT consultations_payment_status_check CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
    CONSTRAINT consultations_rating_check CHECK (rating >= 1 AND rating <= 5)
);

CREATE INDEX idx_consultations_patient_id ON consultations(patient_id);
CREATE INDEX idx_consultations_doctor_id ON consultations(doctor_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_scheduled_date ON consultations(scheduled_date);
CREATE INDEX idx_consultations_payment_status ON consultations(payment_status);

CREATE TRIGGER update_consultations_updated_at BEFORE UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update doctor rating
CREATE TRIGGER update_doctor_rating_trigger AFTER INSERT OR UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION update_doctor_rating();

-- Trigger to increment doctor consultation count
CREATE OR REPLACE FUNCTION increment_doctor_consultations()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE doctors
        SET total_consultations = total_consultations + 1
        WHERE id = NEW.doctor_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_doctor_consultations_trigger AFTER UPDATE ON consultations
    FOR EACH ROW EXECUTE FUNCTION increment_doctor_consultations();

-- Consultation attachments
CREATE TABLE consultation_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    consultation_id UUID NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
    file_type VARCHAR(50) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    uploaded_by UUID REFERENCES users(id),
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT consultation_attachments_type_check CHECK (file_type IN ('image', 'document', 'lab_result'))
);

CREATE INDEX idx_consultation_attachments_consultation_id ON consultation_attachments(consultation_id);
