import { sql } from "drizzle-orm";
import { db } from "..";
import { seedAuthors } from "./library/seedAuthors";
import { seedBooks } from "./library/seedBooks";
import { seedImages } from "./seedImages";
import { seedUserEmails } from "./seedUserEmails";
import { seedUsers } from "./seedUsers";
import { seedBlocks } from "./tale-reader/seedBlocks";
import { seedBranches } from "./tale-reader/seedBranches";
import { seedEntries } from "./tale-reader/seedEntries";
import { seedFragments } from "./tale-reader/seedFragments";
import { seedPages } from "./tale-reader/seedPages";
import { seedParts } from "./tale-reader/seedParts";
import { seedPaths } from "./tale-reader/seedPaths";
import { seedSections } from "./tale-reader/seedSections";
import { seedTalePermissions } from "./tale-reader/seedTalePermissions";
import { seedTales } from "./tale-reader/seedTales";

async function main() {
	await db.execute(sql`DELETE FROM talescape_fragment;`);
	await db.execute(
		sql`ALTER SEQUENCE talescape_fragment_id_seq RESTART WITH 1;`,
	);

	await db.execute(sql`DELETE FROM talescape_block;`);
	await db.execute(sql`ALTER SEQUENCE talescape_block_id_seq RESTART WITH 1;`);

	await db.execute(sql`DELETE FROM talescape_section;`);
	await db.execute(
		sql`ALTER SEQUENCE talescape_section_id_seq RESTART WITH 1;`,
	);

	await db.execute(sql`DELETE FROM talescape_path;`);
	await db.execute(sql`ALTER SEQUENCE talescape_path_id_seq RESTART WITH 1;`);

	await db.execute(sql`DELETE FROM talescape_branch;`);
	await db.execute(sql`ALTER SEQUENCE talescape_branch_id_seq RESTART WITH 1;`);

	await db.execute(sql`DELETE FROM talescape_page;`);
	await db.execute(sql`ALTER SEQUENCE talescape_page_id_seq RESTART WITH 1;`);

	await db.execute(sql`DELETE FROM talescape_entry;`);
	await db.execute(sql`ALTER SEQUENCE talescape_entry_id_seq RESTART WITH 1;`);

	await db.execute(sql`DELETE FROM talescape_part;`);
	await db.execute(sql`ALTER SEQUENCE talescape_part_id_seq RESTART WITH 1;`);

	await db.execute(sql`DELETE FROM talescape_tale_permission;`);
	await db.execute(
		sql`ALTER SEQUENCE talescape_tale_permission_id_seq RESTART WITH 1;`,
	);

	await db.execute(sql`DELETE FROM talescape_tale_progress;`);
	await db.execute(
		sql`ALTER SEQUENCE talescape_tale_progress_id_seq RESTART WITH 1;`,
	);

	await db.execute(sql`DELETE FROM talescape_tale;`);
	await db.execute(sql`ALTER SEQUENCE talescape_tale_id_seq RESTART WITH 1;`);

	await db.execute(sql`DELETE FROM talescape_book_permission;`);
	await db.execute(
		sql`ALTER SEQUENCE talescape_book_permission_id_seq RESTART WITH 1;`,
	);

	await db.execute(sql`DELETE FROM talescape_book;`);
	await db.execute(sql`ALTER SEQUENCE talescape_book_id_seq RESTART WITH 1;`);

	await db.execute(sql`DELETE FROM talescape_author_permission;`);
	await db.execute(
		sql`ALTER SEQUENCE talescape_author_permission_id_seq RESTART WITH 1;`,
	);

	await db.execute(sql`DELETE FROM talescape_author;`);
	await db.execute(sql`ALTER SEQUENCE talescape_author_id_seq RESTART WITH 1;`);

	await db.execute(sql`DELETE FROM talescape_image;`);
	await db.execute(sql`ALTER SEQUENCE talescape_image_id_seq RESTART WITH 1;`);

	await db.execute(sql`DELETE FROM "talescape_userEmail";`);
	await db.execute(sql`DELETE FROM talescape_user;`);

	await seedUsers();
	await seedUserEmails();
	await seedImages();
	await seedAuthors();
	await seedBooks();
	await seedTales();
	await seedTalePermissions();
	await seedParts();
	await seedEntries();
	await seedPages();
	await seedBranches();
	await seedSections();
	await seedBlocks();
	await seedPaths();
	await seedFragments();
	console.log("✅ Database seeding complete!");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
