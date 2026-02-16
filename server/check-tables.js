
const { Sequelize } = require('sequelize-typescript');
const { Client } = require('pg');

async function checkTables() {
    // Read .env manually or hardcode for test IF we can't load ConfigModule easily in script
    // But let's try to assume env vars are set or we can parse .env

    const fs = require('fs');
    const path = require('path');
    const envPath = path.resolve(__dirname, '.env');

    let dbUrl = '';
    if (fs.existsSync(envPath)) {
        const envConfig = require('dotenv').parse(fs.readFileSync(envPath));
        dbUrl = envConfig.DATABASE_URL;
    }

    if (!dbUrl) {
        console.error('DATABASE_URL not found in .env');
        return;
    }

    console.log('Connecting to DB...');
    const client = new Client({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false } // Assuming dev
    });

    try {
        await client.connect();

        const res = await client.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
      `);

        console.log('Tables found:', res.rows.map(r => r.table_name));

        const medicalDocs = res.rows.find(r => r.table_name === 'medical_documents');
        if (medicalDocs) {
            console.log('medical_documents table EXISTS.');
            // Check columns
            const cols = await client.query(`
              SELECT column_name, data_type 
              FROM information_schema.columns 
              WHERE table_name = 'medical_documents'
          `);
            console.log('medical_documents columns:', cols.rows);
        } else {
            console.error('medical_documents table MISSING!');
        }

        // Check user_profiles columns
        const userProfileCols = await client.query(`
              SELECT column_name, data_type 
              FROM information_schema.columns 
              WHERE table_name = 'user_profiles'
          `);
        console.log('user_profiles columns:', userProfileCols.rows.map(c => `${c.column_name} (${c.data_type})`));


    } catch (err) {
        console.error('DB Error:', err);
    } finally {
        await client.end();
    }
}

checkTables();
