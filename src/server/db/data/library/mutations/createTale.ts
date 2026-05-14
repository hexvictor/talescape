import "server-only";

import { db } from "~/server/db";
import {
	blocks,
	branches,
	entries,
	fragments,
	pages,
	parts,
	paths,
	sections,
	talePermissions,
	tales,
} from "~/server/db/schema";

const taleTypes = ["story", "codex", "timeline"] as const;
const visibilityTypes = ["public", "private", "restricted"] as const;
const statusTypes = [
	"draft",
	"review",
	"approved",
	"rejected",
	"published",
	"archived",
] as const;
const branchModes = ["linear", "branching"] as const;
const orientations = ["vertical", "horizontal"] as const;
const directions = ["down", "up", "right", "left"] as const;
const defaultInputMode = ["buttons", "keyboard", "touch"] as [
	"buttons",
	"keyboard",
	"touch",
];

export async function createTaleFromForm(userId: string, formData: FormData) {
	const existingUser = await db.query.users.findFirst({
		where: (model, { eq }) => eq(model.id, userId),
	});

	if (!existingUser) {
		return { status: "missing-user" as const };
	}

	const title = readText(formData, "title", "Untitled Tale");
	const description = readText(
		formData,
		"description",
		"A newly drafted Talescape tale.",
	);
	const type = readOption(formData, "type", taleTypes, "story");
	const visibility = readOption(
		formData,
		"visibility",
		visibilityTypes,
		"private",
	);
	const status = readOption(formData, "status", statusTypes, "draft");
	const bookId = readNullableNumber(formData, "bookId");
	const partTitle = readText(formData, "partTitle", "Part 1");
	const entryTitle = readText(formData, "entryTitle", "Opening");
	const pageCount = readNumber(formData, "pageCount", 3, 1, 12);
	const mainBranchName = readText(formData, "mainBranchName", "Main");
	const branchMode = readOption(formData, "branchMode", branchModes, "linear");
	const choiceBranchName = readText(
		formData,
		"choiceBranchName",
		"Choice Path",
	);
	const pathLabel = readText(formData, "pathLabel", "Choose another route");
	const orientation = readOption(
		formData,
		"orientation",
		orientations,
		"vertical",
	);
	const direction = readOption(formData, "direction", directions, "down");
	const blocksPerBranch = readNumber(formData, "blocksPerBranch", 3, 1, 12);
	const starterText = readText(
		formData,
		"starterText",
		"Begin writing this moment.",
	);
	const slug = `${slugify(title)}-${Date.now().toString(36)}`;

	const taleId = await db.transaction(async (tx) => {
		const [createdTale] = await tx
			.insert(tales)
			.values({
				creatorId: userId,
				bookId,
				title,
				slug,
				description,
				isOfficial: false,
				isVerified: false,
				editable: true,
				visibility,
				status,
				cloneable: "private",
				type,
			})
			.returning({ id: tales.id });

		if (!createdTale) {
			throw new Error("Unable to create tale");
		}

		await tx.insert(talePermissions).values({
			taleId: createdTale.id,
			userId,
			permissionTypes: ["viewer", "collaborator", "cloner"],
		});

		const [createdPart] = await tx
			.insert(parts)
			.values({
				taleId: createdTale.id,
				title: partTitle,
				index: 0,
			})
			.returning({ id: parts.id });

		if (!createdPart) throw new Error("Unable to create part");

		const [createdEntry] = await tx
			.insert(entries)
			.values({
				taleId: createdTale.id,
				partId: createdPart.id,
				title: entryTitle,
				type: "chapter",
				index: 0,
			})
			.returning({ id: entries.id });

		if (!createdEntry) throw new Error("Unable to create entry");

		const createdPages = await tx
			.insert(pages)
			.values(
				Array.from({ length: pageCount }, (_, index) => ({
					taleId: createdTale.id,
					partId: createdPart.id,
					entryId: createdEntry.id,
					type: "book" as const,
					isPaginated: true,
					index,
				})),
			)
			.returning({ id: pages.id, index: pages.index });

		const branchNames =
			branchMode === "branching"
				? [mainBranchName, choiceBranchName]
				: [mainBranchName];

		const createdBranches = await tx
			.insert(branches)
			.values(
				branchNames.map((name, index) => ({
					taleId: createdTale.id,
					creatorId: userId,
					name,
					index,
					isOfficial: false,
					isVerified: false,
					editable: true,
					visibility,
					cloneable: "private" as const,
				})),
			)
			.returning({ id: branches.id, index: branches.index });

		const createdSections = await tx
			.insert(sections)
			.values(
				createdBranches.map((branch) => ({
					taleId: createdTale.id,
					branchId: branch.id,
					creatorId: userId,
					orientation,
					direction,
					inputMode: defaultInputMode,
					isOfficial: false,
					isVerified: false,
					editable: true,
					isSnap: false,
					index: 0,
					visibility,
					cloneable: "private" as const,
				})),
			)
			.returning({ id: sections.id, branchId: sections.branchId });

		if (branchMode === "branching" && createdBranches.length > 1) {
			const [fromBranch, toBranch] = createdBranches;

			if (fromBranch && toBranch) {
				await tx.insert(paths).values({
					taleId: createdTale.id,
					fromBranchId: fromBranch.id,
					toBranchId: toBranch.id,
					creatorId: userId,
					type: "choice",
					isOfficial: false,
					isVerified: false,
					editable: true,
					visibility,
					label: pathLabel,
					order: 0,
				});
			}
		}

		const blockValues = createdSections.flatMap((section, sectionIndex) =>
			Array.from({ length: blocksPerBranch }, (_, blockIndex) => {
				const page = createdPages[blockIndex % createdPages.length];

				return {
					taleId: createdTale.id,
					sectionId: section.id,
					entryId: createdEntry.id,
					partId: createdPart.id,
					creatorId: userId,
					isOfficial: false,
					isVerified: false,
					editable: true,
					pageId: page?.id ?? null,
					isSnap: false,
					index: blockIndex,
					visibility,
					cloneable: "private" as const,
					sectionIndex,
				};
			}),
		);

		const createdBlocks = await tx
			.insert(blocks)
			.values(blockValues.map(({ sectionIndex: _, ...value }) => value))
			.returning({ id: blocks.id, index: blocks.index });

		await tx.insert(fragments).values(
			createdBlocks.map((block, index) => ({
				taleId: createdTale.id,
				blockId: block.id,
				creatorId: userId,
				type: "text" as const,
				isOfficial: false,
				isVerified: false,
				editable: true,
				index: 0,
				visibility,
				cloneable: "private" as const,
				data: {
					content: createStarterFragmentText(starterText, index),
				},
			})),
		);

		return createdTale.id;
	});

	return { status: "created" as const, taleId };
}

function readText(formData: FormData, key: string, fallback: string) {
	const value = formData.get(key);

	if (typeof value !== "string") return fallback;

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : fallback;
}

function readNumber(
	formData: FormData,
	key: string,
	fallback: number,
	min: number,
	max: number,
) {
	const value = Number(formData.get(key));

	if (!Number.isFinite(value)) return fallback;

	return Math.min(max, Math.max(min, Math.round(value)));
}

function readNullableNumber(formData: FormData, key: string) {
	const value = formData.get(key);

	if (typeof value !== "string" || value === "none" || value.trim() === "") {
		return null;
	}

	const number = Number(value);
	return Number.isFinite(number) ? number : null;
}

function readOption<const TOptions extends readonly string[]>(
	formData: FormData,
	key: string,
	options: TOptions,
	fallback: TOptions[number],
) {
	const value = formData.get(key);

	if (typeof value !== "string") return fallback;

	return options.includes(value) ? (value as TOptions[number]) : fallback;
}

function slugify(value: string) {
	const slug = value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return slug || "untitled-tale";
}

function createStarterFragmentText(starterText: string, index: number) {
	return starterText.replaceAll("{block}", String(index + 1));
}
