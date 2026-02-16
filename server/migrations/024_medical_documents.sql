-- Create medical_documents table
CREATE TABLE IF NOT EXISTS "medical_documents" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "patient_id" UUID NOT NULL REFERENCES "users" ("id") ON DELETE CASCADE,
    "doctor_id" UUID NOT NULL REFERENCES "doctors" ("id") ON DELETE SET NULL,
    "category" VARCHAR(50) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "file_url" VARCHAR(255) NOT NULL,
    "metadata" JSONB,
    "date" DATE DEFAULT CURRENT_DATE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS "idx_medical_documents_patient_id" ON "medical_documents" ("patient_id");
CREATE INDEX IF NOT EXISTS "idx_medical_documents_category" ON "medical_documents" ("category");

-- Add insurance_number to user_profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_profiles' AND column_name = 'insurance_number') THEN
        ALTER TABLE "user_profiles" ADD COLUMN "insurance_number" VARCHAR(50);
    END IF;
END $$;
