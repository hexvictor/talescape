import { config } from "dotenv";
import type { Config } from "drizzle-kit";
import { z } from "zod";

config({ path: ".env.local" });

const POSTGRES_URL = z.string().url().parse(process.env.POSTGRES_URL);

export default {
	schema: "./src/server/db/schema.ts",
	out: "./src/server/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		url: POSTGRES_URL,
	},
	tablesFilter: ["talescape_*"],
} satisfies Config;
