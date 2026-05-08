import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "~/server/db";

type QueryResult<T> = T[] | { rows?: T[] };

function rowsFrom<T>(result: QueryResult<T>) {
	return Array.isArray(result) ? result : (result.rows ?? []);
}

function getPostgresUrlFingerprint() {
	const rawUrl = process.env.POSTGRES_URL;

	if (!rawUrl) {
		return {
			postgresUrl: "missing",
		};
	}

	try {
		const url = new URL(rawUrl);

		return {
			postgresUrlHash: createHash("sha256")
				.update(rawUrl)
				.digest("hex")
				.slice(0, 16),
			postgresHost: url.hostname,
			postgresDatabase: url.pathname.replace(/^\//, ""),
			postgresUser: decodeURIComponent(url.username),
			postgresOptions: [...url.searchParams.keys()].sort(),
		};
	} catch {
		return {
			postgresUrl: "invalid",
			postgresUrlHash: createHash("sha256")
				.update(rawUrl)
				.digest("hex")
				.slice(0, 16),
		};
	}
}

export async function logDatabaseDiagnostics(context: string) {
	try {
		const runtimeResult = await db.execute(sql`
			select
				current_database() as "currentDatabase",
				current_schema() as "currentSchema",
				current_user as "currentUser",
				session_user as "sessionUser",
				current_setting('search_path') as "searchPath",
				to_regclass('"talescape_block"')::text as "resolvedTalescapeBlock",
				to_regclass('public."talescape_block"')::text as "publicTalescapeBlock"
		`);

		const tableResult = await db.execute(sql`
			select
				n.nspname as "schemaName",
				c.relname as "tableName",
				c.oid::regclass::text as "resolvedName",
				c.relkind as "relationKind"
			from pg_class c
			join pg_namespace n on n.oid = c.relnamespace
			where c.relname = 'talescape_block'
			order by n.nspname
		`);

		const columnResult = await db.execute(sql`
			select
				table_schema as "schemaName",
				column_name as "columnName",
				ordinal_position as "ordinalPosition",
				data_type as "dataType"
			from information_schema.columns
			where table_name = 'talescape_block'
			order by table_schema, ordinal_position
		`);

		console.error(
			"Database diagnostics:",
			JSON.stringify(
				{
					context,
					deployment: {
						nodeEnv: process.env.NODE_ENV,
						vercelEnv: process.env.VERCEL_ENV,
						vercelTargetEnv: process.env.VERCEL_TARGET_ENV,
						vercelUrl: process.env.VERCEL_URL,
						vercelGitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
					},
					connection: getPostgresUrlFingerprint(),
					runtime: rowsFrom(runtimeResult),
					tables: rowsFrom(tableResult),
					columns: rowsFrom(columnResult),
				},
				null,
				2,
			),
		);
	} catch (diagnosticError) {
		console.error("Failed to log database diagnostics:", diagnosticError);
	}
}
