#!/bin/bash
# run_seeds.sh

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
echo "  MyDermaLife Database Seeding Tool"
echo "========================================"
echo ""

# Run seeds
echo -e "${YELLOW}Running seed files...${NC}"
echo ""

seed_files=(
    "001_admin_and_roles.sql"
    "002_doctors.sql"
    "003_patients.sql"
    "004_product_categories.sql"
    "005_products.sql"
    "006_content.sql"
    "007_coupons.sql"
    "008_inventory.sql"
)

for seed_file in "${seed_files[@]}"; do
    seed_path="seeds/$seed_file"

    if [ ! -f "$seed_path" ]; then
        echo -e "${YELLOW}⚠ $seed_file not found, skipping${NC}"
        continue
    fi

    echo -n "Seeding $seed_file... "
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$seed_path" > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "Error running $seed_file"
        exit 1
    fi
done

echo ""
echo -e "${GREEN}All seeds completed successfully!${NC}"
echo ""
echo "========================================"
echo "  Test Credentials"
echo "========================================"
echo ""
echo "Admin Account:"
echo "  Email: admin@mydermalife.com"
echo "  Password: Admin@123"
echo ""
echo "Doctor Account:"
echo "  Email: sarah.ndiaye@mydermalife.com"
echo "  Password: Doctor@123"
echo ""
echo "Patient Account:"
echo "  Email: aminata.kamara@email.com"
echo "  Password: Patient@123"
echo ""
echo "Coupon Codes:"
echo "  WELCOME10 - 10% off for new customers"
echo "  FREESHIP - Free shipping over 30,000 XAF"
echo "  SKINCARE20 - 20% off skincare products"
echo "  CONSULT5000 - 5,000 XAF off first consultation"
echo ""
