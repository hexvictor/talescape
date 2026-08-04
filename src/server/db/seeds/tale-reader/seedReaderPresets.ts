import { db } from "~/server/db";
import {
	officialAnimationPresets,
	officialStylePresets,
	officialTransitionPresets,
	officialVisibilityPresets,
} from "~/server/db/schema";
import {
	animationPresetSeeds,
	stylePresetSeeds,
	transitionPresetSeeds,
	visibilityPresetSeeds,
} from "./readerPresetSeedData";
import { logSeedComplete, logSeedStart } from "./seedLogs";

/**
 * Seeds all administrator-managed reader preset template tables.
 *
 * @returns Nothing.
 */
export async function seedReaderPresets(): Promise<void> {
	await seedOfficialAnimationPresets();
	await seedOfficialStylePresets();
	await seedOfficialTransitionPresets();
	await seedOfficialVisibilityPresets();
}

/**
 * Seeds official animation track templates.
 *
 * @returns Nothing.
 */
async function seedOfficialAnimationPresets(): Promise<void> {
	logSeedStart("Official animation presets");
	await db.insert(officialAnimationPresets).values(
		animationPresetSeeds.map((preset, sortOrder) => ({
			isActive: true,
			name: preset.name,
			sortOrder,
			target: preset.target,
			tracks: preset.tracks,
		})),
	);
	logSeedComplete("Official animation presets");
}

/**
 * Seeds official style templates.
 *
 * @returns Nothing.
 */
async function seedOfficialStylePresets(): Promise<void> {
	logSeedStart("Official style presets");
	await db.insert(officialStylePresets).values(
		stylePresetSeeds.map((preset, sortOrder) => ({
			isActive: true,
			name: preset.name,
			sortOrder,
			styleConfig: preset.styleConfig,
			target: preset.target,
		})),
	);
	logSeedComplete("Official style presets");
}

/**
 * Seeds official transition templates.
 *
 * @returns Nothing.
 */
async function seedOfficialTransitionPresets(): Promise<void> {
	logSeedStart("Official transition presets");
	const animations = await db
		.select({ id: officialAnimationPresets.id })
		.from(officialAnimationPresets)
		.orderBy(officialAnimationPresets.sortOrder);
	await db.insert(officialTransitionPresets).values(
		transitionPresetSeeds.map((preset, sortOrder) => ({
			enteringAnimationPresetIds: preset.enteringAnimationPresetIndexes.flatMap(
				(index) => (animations[index] ? [animations[index].id] : []),
			),
			flowConfig: preset.flow,
			isActive: true,
			leavingAnimationPresetIds: preset.leavingAnimationPresetIndexes.flatMap(
				(index) => (animations[index] ? [animations[index].id] : []),
			),
			name: preset.name,
			sortOrder,
		})),
	);
	logSeedComplete("Official transition presets");
}

/**
 * Seeds official visibility templates.
 *
 * @returns Nothing.
 */
async function seedOfficialVisibilityPresets(): Promise<void> {
	logSeedStart("Official visibility presets");
	await db.insert(officialVisibilityPresets).values(
		visibilityPresetSeeds.map((preset, sortOrder) => ({
			isActive: true,
			name: preset.name,
			range: preset.range,
			sortOrder,
		})),
	);
	logSeedComplete("Official visibility presets");
}
