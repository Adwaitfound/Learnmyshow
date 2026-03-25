const { createClient } = require("@supabase/supabase-js");
const { Client } = require("pg");

const supabase = createClient(
  "https://yputuhcllehumvnialtd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlwdXR1aGNsbGVodW12bmlhbHRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzE0NTc2MiwiZXhwIjoyMDg4NzIxNzYyfQ.FfzUMewb278ReZ5cEkHQqX05a6B7tKb5dXj24M7mA2U"
);

const pg = new Client({
  host: "aws-1-ap-south-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.yputuhcllehumvnialtd",
  password: "Footb@ll77@dw@it0412",
  ssl: { rejectUnauthorized: false },
});

const EMAIL = "adwait@thefoundproject.com";
const PASSWORD = "Footb@ll77@dw@it0412";

async function run() {
  await pg.connect();

  // Check if user exists in Supabase Auth
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existing = existingUsers?.users?.find((u) => u.email === EMAIL);

  let userId;

  if (existing) {
    console.log("User already exists in auth:", existing.id);
    userId = existing.id;
  } else {
    // Create the user via admin API (auto-confirmed, no email needed)
    const { data, error } = await supabase.auth.admin.createUser({
      email: EMAIL,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { name: "Adwait", role: "SUPER_ADMIN" },
      app_metadata: { role: "SUPER_ADMIN" },
    });

    if (error) {
      console.error("Error creating auth user:", error.message);
      await pg.end();
      return;
    }
    userId = data.user.id;
    console.log("Created auth user:", userId);
  }

  // Set role in app_metadata (in case user already existed)
  await pg.query(
    `UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || '{"role": "SUPER_ADMIN"}'::jsonb WHERE id = $1`,
    [userId]
  );
  console.log("Set app_metadata role to SUPER_ADMIN");

  // Upsert into Prisma users table (mapped via @@map("users"))
  const { rows } = await pg.query(
    `INSERT INTO users (id, email, name, role, "createdAt", "updatedAt")
     VALUES ($1, $2, 'Adwait', 'SUPER_ADMIN', NOW(), NOW())
     ON CONFLICT (id) DO UPDATE SET role = 'SUPER_ADMIN', "updatedAt" = NOW()
     RETURNING id, email, role`,
    [userId, EMAIL]
  );
  console.log("Prisma User record:", rows[0]);

  await pg.end();
  console.log("\nDone! adwait@thefoundproject.com is now SUPER_ADMIN");
  console.log("Login with:", EMAIL, "/ password you set");
}

run().catch((e) => {
  console.error("Error:", e.message);
  pg.end();
  process.exit(1);
});
