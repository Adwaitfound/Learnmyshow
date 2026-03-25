const { Client } = require("pg");

const pg = new Client({
  host: "aws-1-ap-south-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.yputuhcllehumvnialtd",
  password: "Footb@ll77@dw@it0412",
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await pg.connect();

  // List all tables in public schema
  const { rows } = await pg.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);
  console.log("Tables in public schema:");
  rows.forEach((r) => console.log(" -", r.table_name));

  // Also check if there are any schemas
  const { rows: schemas } = await pg.query(`
    SELECT schema_name FROM information_schema.schemata ORDER BY schema_name
  `);
  console.log("\nAll schemas:");
  schemas.forEach((s) => console.log(" -", s.schema_name));

  await pg.end();
}

run().catch((e) => {
  console.error("Error:", e.message);
  pg.end();
});
