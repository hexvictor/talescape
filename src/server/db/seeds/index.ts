import { sql } from "drizzle-orm";
import { db } from "..";
import { seedAuthors } from "./library/seedAuthors";
import { seedBooks } from "./library/seedBooks";
import { seedBlockEmbeds } from "./tale-reader/seedBlockEmbeds";
import { seedBlocks } from "./tale-reader/seedBlocks";
import { seedEntries } from "./tale-reader/seedEntries";
import { seedEntryRanges } from "./tale-reader/seedEntryRanges";
import { seedFragmentEmbeds } from "./tale-reader/seedFragmentEmbeds";
import { seedFragments } from "./tale-reader/seedFragments";
import { seedPages } from "./tale-reader/seedPages";
import { seedPartRanges } from "./tale-reader/seedPartRanges";
import { seedSectionEmbeds } from "./tale-reader/seedSectionEmbeds";
import { seedSections } from "./tale-reader/seedSections";
import { seedTalePermissions } from "./tale-reader/seedTalePermissions";
import { seedTales } from "./tale-reader/seedTales";
import { seedParts } from "./tale-reader/seetParts";
import { seedImages } from "./seedImages";
async function main() {
	// DELETE AND RESET RANGES FIRST (most dependent)
	await db.execute(sql`DELETE FROM talescape_entry_range;`);
	await db.execute(
		sql`ALTER SEQUENCE talescape_entry_range_id_seq RESTART WITH 1;`,
	);

	await db.execute(sql`DELETE FROM talescape_part_range;`);
	await db.execute(
		sql`ALTER SEQUENCE talescape_part_range_id_seq RESTART WITH 1;`,
	);

	// FRAGMENT + EMBED
	await db.execute(sql`DELETE FROM talescape_fragment_embed;`);
	await db.execute(
		sql`ALTER SEQUENCE talescape_fragment_embed_id_seq RESTART WITH 1;`,
	);

	await db.execute(sql`DELETE FROM talescape_fragment;`);
	await db.execute(
		sql`ALTER SEQUENCE talescape_fragment_id_seq RESTART WITH 1;`,
	);

	// BLOCK + EMBED
	await db.execute(sql`DELETE FROM talescape_block_embed;`);
	await db.execute(
		sql`ALTER SEQUENCE talescape_block_embed_id_seq RESTART WITH 1;`,
	);

	await db.execute(sql`DELETE FROM talescape_block;`);
	await db.execute(sql`ALTER SEQUENCE talescape_block_id_seq RESTART WITH 1;`);

	// SECTION + EMBED
	await db.execute(sql`DELETE FROM talescape_section_embed;`);
	await db.execute(
		sql`ALTER SEQUENCE talescape_section_embed_id_seq RESTART WITH 1;`,
	);

	await db.execute(sql`DELETE FROM talescape_section;`);
	await db.execute(
		sql`ALTER SEQUENCE talescape_section_id_seq RESTART WITH 1;`,
	);

	// PAGES
	await db.execute(sql`DELETE FROM talescape_page;`);
	await db.execute(sql`ALTER SEQUENCE talescape_page_id_seq RESTART WITH 1;`);

	// ENTRIES
	await db.execute(sql`DELETE FROM talescape_entry;`);
	await db.execute(sql`ALTER SEQUENCE talescape_entry_id_seq RESTART WITH 1;`);

	// PARTS
	await db.execute(sql`DELETE FROM talescape_part;`);
	await db.execute(sql`ALTER SEQUENCE talescape_part_id_seq RESTART WITH 1;`);

	// TALE PERMISSIONS
	await db.execute(sql`DELETE FROM talescape_tale_permission;`);
	await db.execute(
		sql`ALTER SEQUENCE talescape_tale_permission_id_seq RESTART WITH 1;`,
	);

	// TALES PROGRESS
	await db.execute(sql`DELETE FROM talescape_tale_progress;`);
	await db.execute(
		sql`ALTER SEQUENCE talescape_tale_progress_id_seq RESTART WITH 1;`,
	);

	// TALES
	await db.execute(sql`DELETE FROM talescape_tale;`);
	await db.execute(sql`ALTER SEQUENCE talescape_tale_id_seq RESTART WITH 1;`);

	// BOOKS
	await db.execute(sql`DELETE FROM talescape_book;`);
	await db.execute(sql`ALTER SEQUENCE talescape_book_id_seq RESTART WITH 1;`);

	// AUTHORS
	await db.execute(sql`DELETE FROM talescape_author;`);
	await db.execute(sql`ALTER SEQUENCE talescape_author_id_seq RESTART WITH 1;`);

	// Image (least dependent)
	await db.execute(sql`DELETE FROM talescape_image;`);
	await db.execute(sql`ALTER SEQUENCE talescape_image_id_seq RESTART WITH 1;`);

	// --- SEED INDEPENDENT TO DEPENDENT ORDER ---
	await seedImages();
	await seedAuthors();
	await seedBooks();
	await seedTales();
	await seedTalePermissions();
	await seedParts();
	await seedEntries();
	await seedPages();
	await seedSections();
	await seedSectionEmbeds();
	await seedBlocks();
	await seedBlockEmbeds();
	await seedFragments();
	await seedFragmentEmbeds();
	await seedPartRanges();
	await seedEntryRanges();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
