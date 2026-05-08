import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env" });

if (!process.env.POSTGRES_URL) {
	throw new Error("POSTGRES_URL is not defined");
}

const sql = neon(process.env.POSTGRES_URL);
export const db = drizzle({ client: sql, schema: schema });
