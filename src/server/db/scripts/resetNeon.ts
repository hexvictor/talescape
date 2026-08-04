import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env" });

const connectionString = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error("POSTGRES_URL or DATABASE_URL is not defined");
}

const sql = neon(connectionString);

async function resetSchema() {
	try {
		await sql`DROP SCHEMA IF EXISTS drizzle CASCADE;`;
		await sql`DROP SCHEMA public CASCADE;`;
		await sql`CREATE SCHEMA public;`;
		console.log("✅ Neon schema reset successfully");
	} catch (error) {
		console.error("❌ Failed to reset schema:", error);
	}
}

resetSchema().then(() => process.exit());
