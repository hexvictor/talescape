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

async function main() {
  // await seedAuthors();
  // await seedBooks();
  // await seedTales();
  // await seedTalePermissions();
  // await seedParts();
  // await seedEntries();
  // await seedPages();
  // await seedSections();
  // await seedSectionEmbeds();
  // await seedBlocks();
  await db.execute(sql`DELETE FROM talescape_block_embed;`);
  await db.execute(
    sql`ALTER SEQUENCE talescape_block_embed_id_seq RESTART WITH 1;`
  );
  await seedBlockEmbeds();
  // await seedFragments();
  // await seedFragmentEmbeds();
  // await seedPartRanges();
  // await seedEntryRanges();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
