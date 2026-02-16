const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/mydermalife_db' });

async function run() {
    try {
        await client.connect();
        console.log('Connected to database.');

        // Check if column exists
        const res = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='doctor_availability' AND column_name='date';
    `);

        if (res.rows.length === 0) {
            console.log('Column "date" missing. Adding it now...');
            await client.query('ALTER TABLE doctor_availability ADD COLUMN "date" DATE NULL;');
            console.log('Column "date" added successfully.');
        } else {
            console.log('Column "date" already exists.');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

run();
