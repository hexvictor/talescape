import { seedBranches } from "./seedBranches";
import { seedElements } from "./seedElements";
import { seedEntries } from "./seedEntries";
import { seedFrames } from "./seedFrames";
import { seedPages } from "./seedPages";
import { seedParts } from "./seedParts";
import { seedPaths } from "./seedPaths";
import { seedReaderPresets } from "./seedReaderPresets";
import { seedScenes } from "./seedScenes";
import { seedKeyframes } from "./seedKeyframes";
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
	await seedScenes();
	await seedFrames();
	await seedKeyframes();
	await seedPaths();
	await seedElements();
	console.log("✅ Reader tale seeded!");
}
