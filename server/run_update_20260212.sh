#!/bin/bash
# run_update_20260212.sh

DB_NAME="mydermalife_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
DB_PASSWORD="postgres"

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================"
echo "  MyDermaLife Database Update Tool"
echo "  (Fixing missing columns)"
echo "========================================"
echo ""

# Run migrations
echo -e "${YELLOW}Running update migrations...${NC}"
echo ""

migration_files=(
    "015_add_is_patient_online_to_consultations.sql"
    "015_product_routines.sql"
    "020_update_prescriptions_schema.sql"
    "023_add_signature_to_doctors.sql"
    "024_medical_documents.sql"
    "025_add_transcription_to_consultations.sql"
)

for migration_file in "${migration_files[@]}"; do
    migration_path="migrations/$migration_file"

    if [ ! -f "$migration_path" ]; then
        echo -e "${RED}✗ $migration_file not found${NC}"
        continue
    fi

    echo -n "Running $migration_file... "
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$migration_path" > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "Error running $migration_file. Check the SQL syntax."
        exit 1
    fi
done

echo ""
echo -e "${GREEN}All updates completed successfully!${NC}"
echo ""
