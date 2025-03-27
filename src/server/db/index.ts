// src/db.ts
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
import * as schema from "./schema";

config({ path: ".env" }); // or .env.local

console.log("POSTGRES_URL:", process.env.POSTGRES_URL); // add this
if (!process.env.POSTGRES_URL) {
	console.log(process.env);
	throw new Error("POSTGRES_URL is not defined");
}

const sql = neon(process.env.POSTGRES_URL);
export const db = drizzle({ client: sql, schema: schema });
