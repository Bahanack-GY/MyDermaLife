const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/mydermalife_db' });
client.connect();
client.query('SELECT "doctor_id", "day_of_week", "start_time", "end_time" FROM doctor_availability', (err, res) => {
    if (err) console.error(err);
    else console.log(JSON.stringify(res.rows, null, 2));
    client.end();
});
