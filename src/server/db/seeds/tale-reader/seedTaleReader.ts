import { seedBlocks } from "./seedBlocks";
import { seedBranches } from "./seedBranches";
import { seedEntries } from "./seedEntries";
import { seedFragments } from "./seedFragments";
import { seedNodes } from "./seedNodes";
import { seedPages } from "./seedPages";
import { seedParts } from "./seedParts";
import { seedPaths } from "./seedPaths";
import { seedReaderPresets } from "./seedReaderPresets";
import { seedTalePermissions } from "./seedTalePermissions";
import { seedTales } from "./seedTales";

/**
 * Seeds official templates and one complete production-shaped reader tale.
 *
 * @returns Nothing.
 */
export async function seedTaleReader(): Promise<void> {
	await seedReaderPresets();
	await seedTales();
	await seedTalePermissions();
	await seedParts();
	await seedEntries();
	await seedPages();
	await seedBranches();
	await seedBlocks();
	await seedPaths();
	await seedNodes();
	await seedFragments();
	console.log("✅ Reader tale seeded!");
}
