import { config } from "dotenv";
import type { Config } from "drizzle-kit";

config({ path: process.env.DOTENV_CONFIG_PATH ?? ".env" });

if (!process.env.POSTGRES_URL) {
	throw new Error("POSTGRES_URL is not defined");
}

export default {
	schema: "./src/server/db/schema.ts",
	out: "./src/server/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: process.env.POSTGRES_URL,
	},
	tablesFilter: ["talescape_*"],
} satisfies Config;
