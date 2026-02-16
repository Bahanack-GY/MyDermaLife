-- migrations/003_doctors.sql

-- Doctors table
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    specialization VARCHAR(200),
    years_of_experience INTEGER,
    bio TEXT,
    education JSONB,
    certifications JSONB,
    languages_spoken JSONB,
    consultation_fee DECIMAL(10,2),
    video_consultation_fee DECIMAL(10,2),
    rating DECIMAL(2,1) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_consultations INTEGER DEFAULT 0,
    verification_status VARCHAR(50) DEFAULT 'pending',
    verified_at TIMESTAMP,
    verified_by UUID REFERENCES users(id),
    is_available BOOLEAN DEFAULT true,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP,

    CONSTRAINT doctors_verification_status_check CHECK (verification_status IN ('pending', 'verified', 'rejected')),
    CONSTRAINT doctors_status_check CHECK (status IN ('active', 'inactive', 'on_leave')),
    CONSTRAINT doctors_rating_check CHECK (rating >= 0 AND rating <= 5)
);

CREATE INDEX idx_doctors_user_id ON doctors(user_id);
CREATE INDEX idx_doctors_verification_status ON doctors(verification_status);
CREATE INDEX idx_doctors_status ON doctors(status);
CREATE INDEX idx_doctors_is_available ON doctors(is_available);

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Doctor documents
CREATE TABLE doctor_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    document_url VARCHAR(500) NOT NULL,
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    expiry_date DATE,
    uploaded_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT doctor_documents_type_check CHECK (document_type IN ('license', 'certification', 'id', 'insurance'))
);

CREATE INDEX idx_doctor_documents_doctor_id ON doctor_documents(doctor_id);
CREATE INDEX idx_doctor_documents_verified ON doctor_documents(verified);

-- Doctor availability
CREATE TABLE doctor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT doctor_availability_day_check CHECK (day_of_week >= 0 AND day_of_week <= 6),
    CONSTRAINT doctor_availability_time_check CHECK (start_time < end_time)
);

CREATE INDEX idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);
CREATE INDEX idx_doctor_availability_day ON doctor_availability(day_of_week);

CREATE TRIGGER update_doctor_availability_updated_at BEFORE UPDATE ON doctor_availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Doctor time off
CREATE TABLE doctor_time_off (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT doctor_time_off_dates_check CHECK (start_date <= end_date)
);

CREATE INDEX idx_doctor_time_off_doctor_id ON doctor_time_off(doctor_id);
CREATE INDEX idx_doctor_time_off_dates ON doctor_time_off(start_date, end_date);
