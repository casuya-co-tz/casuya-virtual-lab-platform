const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: process.env.PGHOST || '127.0.0.1',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE || 'casuya_lab_platform'
});

if (!process.env.PGPASSWORD) {
  console.error('Error: PGPASSWORD environment variable is required.');
  console.error('Usage: PGPASSWORD=yourpassword node scripts/run_migration.js');
  process.exit(1);
}

async function run() {
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, '../supabase/migrations/004_add_teacher_role.sql'), 'utf8');
  try {
    await client.query(sql);
    console.log("Migration successful");
  } catch(e) {
    console.error("Migration failed", e);
  } finally {
    await client.end();
  }
}

run();
