import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import "dotenv/config"; // to read from .env

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function resetSchema() {
  try {
    await sql`DROP SCHEMA public CASCADE;`;
    await sql`CREATE SCHEMA public;`;
    console.log("✅ Neon schema reset successfully");
  } catch (error) {
    console.error("❌ Failed to reset schema:", error);
  }
}

resetSchema().then(() => process.exit());
