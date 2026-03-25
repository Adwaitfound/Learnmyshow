const { Client } = require("pg");

const client = new Client({
  host: "aws-1-ap-south-1.pooler.supabase.com",
  port: 5432,
  database: "postgres",
  user: "postgres.yputuhcllehumvnialtd",
  password: "Footb@ll77@dw@it0412",
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log("Connected to database!");

  // 1. Create handle_new_user function
  await client.query(`
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger AS $$
    BEGIN
      UPDATE auth.users
      SET raw_app_meta_data = raw_app_meta_data ||
        jsonb_build_object('role', COALESCE(NEW.raw_user_meta_data->>'role', 'ATTENDEE'))
      WHERE id = NEW.id;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log("1/3 - Function handle_new_user created");

  // 2. Create trigger
  await client.query(
    "DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users"
  );
  await client.query(`
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
  `);
  console.log("2/3 - Trigger on_auth_user_created created");

  // 3. Create set_user_role function
  await client.query(`
    CREATE OR REPLACE FUNCTION public.set_user_role(user_id UUID, new_role TEXT)
    RETURNS void AS $$
    BEGIN
      UPDATE auth.users
      SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', new_role)
      WHERE id = user_id;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `);
  console.log("3/3 - Function set_user_role created");

  await client.end();
  console.log("\nAll SQL setup complete!");
}

run().catch((e) => {
  console.error("Error:", e.message);
  client.end();
  process.exit(1);
});
