import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
	blocks,
	branches,
	entries,
	fragments,
	nodes,
	pages,
	parts,
	talePermissions,
	tales,
} from "~/server/db/schema";

const taleTypes = ["story", "codex", "timeline"] as const;
const visibilityTypes = ["public", "private", "restricted"] as const;
const cloneableTypes = ["private", "public", "shared"] as const;
const statusTypes = [
	"draft",
	"review",
	"approved",
	"rejected",
	"published",
	"archived",
] as const;

/**
 * Creates a minimal editable tale and starter reader structure from form metadata.
 *
 * @param userId - Clerk user id creating the tale.
 * @param formData - Tale metadata submitted by the library form.
 * @returns Creation status and routing identifiers.
 *
 * @example
 * const result = await createTaleFromForm(userId, formData);
 */
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
	const requestedSlug = readText(formData, "slug", slugify(title));
	const cloneable = readOption(
		formData,
		"cloneable",
		cloneableTypes,
		"private",
	);
	const editable = readBoolean(formData, "editable", true);
	const canManageOfficial = existingUser.role === "administrator";
	const isOfficial = canManageOfficial
		? readBoolean(formData, "isOfficial", false)
		: false;
	const isVerified = canManageOfficial
		? readBoolean(formData, "isVerified", false)
		: false;
	const slug = await createUniqueTaleSlug({
		creatorId: userId,
		isOfficial,
		requestedSlug,
	});

	const taleId = await db.transaction(async (tx) => {
		const [createdTale] = await tx
			.insert(tales)
			.values({
				creatorId: userId,
				bookId,
				title,
				slug,
				description,
				isOfficial,
				isVerified,
				editable,
				visibility,
				status,
				cloneable,
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
				title: "Part 1",
				order: 0,
			})
			.returning({ id: parts.id });

		if (!createdPart) throw new Error("Unable to create part");

		const [createdEntry] = await tx
			.insert(entries)
			.values({
				taleId: createdTale.id,
				partId: createdPart.id,
				title: "Opening",
				type: "chapter",
				order: 0,
			})
			.returning({ id: entries.id });

		if (!createdEntry) throw new Error("Unable to create entry");

		const [createdPage] = await tx
			.insert(pages)
			.values({
				taleId: createdTale.id,
				partId: createdPart.id,
				entryId: createdEntry.id,
				type: "book" as const,
				isPaginated: true,
				order: 0,
			})
			.returning({ id: pages.id });

		if (!createdPage) throw new Error("Unable to create first page");

		const [createdBranch] = await tx
			.insert(branches)
			.values({
				taleId: createdTale.id,
				creatorId: userId,
				name: "root",
				title: "Root",
				order: 0,
				isOfficial,
				isVerified,
				editable,
				visibility,
				cloneable,
			})
			.returning({ id: branches.id });

		if (!createdBranch) throw new Error("Unable to create root branch");

		const [createdBlock] = await tx
			.insert(blocks)
			.values({
				taleId: createdTale.id,
				branchId: createdBranch.id,
				creatorId: userId,
				isOfficial,
				isVerified,
				editable,
				entryId: createdEntry.id,
				pageId: createdPage.id,
				partId: createdPart.id,
				title,
				isSnap: false,
				order: 0,
				sizeMode: "fixed",
				sizeConfig: {
					height: { unit: "viewport", value: 1 },
					horizontalAlignment: "center",
					verticalAlignment: "center",
					width: { unit: "viewport", value: 1 },
				},
				readingConfig: {
					animationConfig: {
						ambient: { tracks: [] },
						scrolling: { tracks: [] },
					},
					readingLength: 800,
					readingLengthMode: "manual",
				},
				styleConfig: {
					backgroundCss: "linear-gradient(145deg, #15131f, #07070a)",
					color: "#fff8e8",
				},
				visibility,
				cloneable,
			})
			.returning({ id: blocks.id });

		if (!createdBlock) throw new Error("Unable to create starter block");

		const [createdRootNode] = await tx
			.insert(nodes)
			.values({
				taleId: createdTale.id,
				blockId: createdBlock.id,
				creatorId: userId,
				stableId: "root",
				name: "Root",
				isRoot: true,
				order: 0,
				config: {
					children: [],
					gap: 0,
					id: "root",
					mode: "flex",
					overflow: "visible",
					parentNodeId: null,
				},
				styleConfig: {
					alignItems: "center",
					display: "flex",
					height: "100%",
					justifyContent: "center",
					padding: "2rem",
					textAlign: "center",
					width: "100%",
				},
				isOfficial,
				isVerified,
				editable,
				visibility,
				cloneable,
			})
			.returning({ id: nodes.id });

		if (!createdRootNode) throw new Error("Unable to create root node");

		const [createdFragment] = await tx
			.insert(fragments)
			.values({
				taleId: createdTale.id,
				blockId: createdBlock.id,
				nodeId: createdRootNode.id,
				creatorId: userId,
				type: "text" as const,
				isOfficial,
				isVerified,
				editable,
				order: 0,
				visibility,
				cloneable,
				data: {
					content: title,
				},
				styleConfig: {
					fontSize: "clamp(2rem, 6vw, 5rem)",
					fontWeight: 800,
					lineHeight: 1.05,
					textAlign: "center",
				},
			})
			.returning({ id: fragments.id });

		if (!createdFragment) throw new Error("Unable to create starter fragment");

		await tx
			.update(nodes)
			.set({
				config: {
					children: [
						{ fragmentId: String(createdFragment.id), type: "fragment" },
					],
					gap: 0,
					id: String(createdRootNode.id),
					mode: "flex",
					overflow: "visible",
					parentNodeId: null,
				},
			})
			.where(eq(nodes.id, createdRootNode.id));

		return createdTale.id;
	});

	return {
		creatorUsername: existingUser.username,
		slug,
		status: "created" as const,
		taleId,
	};
}

/**
 * Reads a non-empty text field from form data.
 *
 * @param formData - Submitted form data.
 * @param key - Field name.
 * @param fallback - Value used when the field is empty.
 * @returns Trimmed text value.
 *
 * @example
 * const title = readText(formData, "title", "Untitled");
 */
function readText(formData: FormData, key: string, fallback: string): string {
	const value = formData.get(key);

	if (typeof value !== "string") return fallback;

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : fallback;
}

/**
 * Reads an optional numeric id from form data.
 *
 * @param formData - Submitted form data.
 * @param key - Field name.
 * @returns Numeric id or null.
 *
 * @example
 * const bookId = readNullableNumber(formData, "bookId");
 */
function readNullableNumber(formData: FormData, key: string): number | null {
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
): TOptions[number] {
	const value = formData.get(key);

	if (typeof value !== "string") return fallback;

	return options.includes(value) ? (value as TOptions[number]) : fallback;
}

/**
 * Reads a boolean-like select value from form data.
 *
 * @param formData - Submitted form data.
 * @param key - Field name.
 * @param fallback - Value used when missing.
 * @returns Parsed boolean.
 *
 * @example
 * const editable = readBoolean(formData, "editable", true);
 */
function readBoolean(
	formData: FormData,
	key: string,
	fallback: boolean,
): boolean {
	const value = formData.get(key);
	if (value === "true") return true;
	if (value === "false") return false;
	return fallback;
}

/**
 * Creates a URL-safe tale slug.
 *
 * @param value - Raw slug or title.
 * @returns URL-safe slug.
 *
 * @example
 * const slug = slugify("New Tale");
 */
function slugify(value: string): string {
	const slug = value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

	return slug || "untitled-tale";
}

/**
 * Creates a unique tale slug inside the correct visibility scope.
 *
 * @param options - Slug scope options.
 * @param options.creatorId - Tale creator id.
 * @param options.isOfficial - Whether official slug uniqueness is required.
 * @param options.requestedSlug - User-entered slug value.
 * @returns Unique slug.
 *
 * @example
 * const slug = await createUniqueTaleSlug({ creatorId, isOfficial: false, requestedSlug: "draft" });
 */
async function createUniqueTaleSlug({
	creatorId,
	isOfficial,
	requestedSlug,
}: {
	creatorId: string;
	isOfficial: boolean;
	requestedSlug: string;
}): Promise<string> {
	const baseSlug = slugify(requestedSlug);
	for (let attempt = 0; attempt < 100; attempt++) {
		const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
		const existing = await db.query.tales.findFirst({
			where: (model) =>
				isOfficial
					? and(eq(model.isOfficial, true), eq(model.slug, slug))
					: and(eq(model.creatorId, creatorId), eq(model.slug, slug)),
			columns: { id: true },
		});
		if (!existing) return slug;
	}
	return `${baseSlug}-${Date.now().toString(36)}`;
}
