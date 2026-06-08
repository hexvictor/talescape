import { sql } from "drizzle-orm";
import { db, dbClient } from "..";
import { seedAuthors } from "./library/seedAuthors";
import { seedBooks } from "./library/seedBooks";
import { seedImages } from "./seedImages";
import { seedUserEmails } from "./seedUserEmails";
import { seedUsers } from "./seedUsers";
import { seedTaleReader } from "./tale-reader/seedTaleReader";

async function main() {
	await db.execute(sql`
		TRUNCATE TABLE
			talescape_author,
			talescape_book,
			talescape_author_permission,
			talescape_book_permission,
			talescape_block,
			talescape_branch,
			talescape_node,
			talescape_fragment,
			talescape_path,
			talescape_entry,
			talescape_page,
			talescape_part,
			talescape_block_permission,
			talescape_branch_permission,
			talescape_fragment_permission,
			talescape_path_permission,
			talescape_tale_permission,
			talescape_official_animation_preset,
			talescape_official_style_preset,
			talescape_official_transition_preset,
			talescape_official_visibility_preset,
			talescape_tale_progress,
			talescape_tale,
			talescape_image,
			"talescape_userEmail",
			talescape_user
		RESTART IDENTITY CASCADE;
	`);

	await seedUsers();
	await seedUserEmails();
	await seedImages();
	await seedAuthors();
	await seedBooks();
	await seedTaleReader();
	console.log("✅ Database seeding complete!");
}

main()
	.catch((err) => {
		console.error(err);
		process.exitCode = 1;
	})
	.finally(async () => {
		await dbClient.end();
	});
