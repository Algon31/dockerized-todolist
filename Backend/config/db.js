const { Pool } = require("pg");

const isProduction = process.env.NODE_ENV === "production";
const isRemoteDb =
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.includes("supabase.co") ||
    process.env.DATABASE_URL.includes("pooler.supabase.com") ||
    process.env.DATABASE_URL.includes("render.com") ||
    process.env.DATABASE_URL.includes("neon.tech") ||
    isProduction);

const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
      }
    : {
        host: process.env.PGHOST || "localhost",
        port: parseInt(process.env.PGPORT || "5432", 10),
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "postgres",
        database: process.env.PGDATABASE || "tododb",
      }
);

pool.on("error", (err) => {
  console.error("Unexpected error on idle PostgreSQL client:", err);
});

const query = (text, params) => pool.query(text, params);

const initDb = async () => {
  try {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create todos table with foreign key to users
    await query(`
      CREATE TABLE IF NOT EXISTS todos (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        todo TEXT NOT NULL,
        iscompleted BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index on user_id for high performance filtering
    await query(`
      CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
    `);

    console.log("PostgreSQL database tables initialized successfully.");
  } catch (err) {
    console.error("Error initializing PostgreSQL database tables:", err);
  }
};

module.exports = {
  pool,
  query,
  initDb,
};
