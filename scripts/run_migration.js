const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  password: 'Mkalanga1994!@',
  database: 'casuya_lab_platform'
});

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
