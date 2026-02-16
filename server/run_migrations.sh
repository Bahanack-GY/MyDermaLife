#!/bin/bash
# run_migrations.sh

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
echo "  MyDermaLife Database Migration Tool"
echo "========================================"
echo ""

# Run migrations
echo -e "${YELLOW}Running migrations...${NC}"
echo ""

migration_files=(
    "001_core_extensions.sql"
    "002_users_authentication.sql"
    "003_doctors.sql"
    "004_patients.sql"
    "005_consultations.sql"
    "006_prescriptions.sql"
    "007_products.sql"
    "008_shopping_cart.sql"
    "009_orders.sql"
    "010_payments.sql"
    "011_content.sql"
    "012_notifications.sql"
    "013_security.sql"
    "014_system.sql"
    "015_add_is_patient_online_to_consultations.sql"
    "015_product_routines.sql"
    "016_inventory_management.sql"
    "017_product_descriptions.sql"
    "018_product_brand_name.sql"
    "019_cart_share_token.sql"
    "020_update_prescriptions_schema.sql"
    "020_search_logs.sql"
    "021_delivery_role.sql"
    "022_routines.sql"
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
echo -e "${GREEN}All migrations completed successfully!${NC}"
echo ""
