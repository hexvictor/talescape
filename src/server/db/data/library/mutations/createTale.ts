import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import {
	authors,
	books,
	branches,
	elements,
	entries,
	frames,
	keyframes,
	pages,
	parts,
	scenes,
	talePermissions,
	tales,
} from "~/server/db/schema";
import { authorAccessCondition, bookAccessCondition } from "../queries/access";

const taleTypes = ["story", "codex", "timeline"] as const;
export class UnavailableTaleSelectionError extends Error {}
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
	const selectedBookId = readNullableNumber(formData, "bookId");
	const selectedAuthorId = readNullableNumber(formData, "authorId");
	const newBookTitle = readText(formData, "newBookTitle", "");
	const newAuthorName = readText(formData, "newAuthorName", "");
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
		let bookId = selectedBookId;
		if (bookId !== null && !newBookTitle) {
			const readableBook = await tx.query.books.findFirst({
				where: and(eq(books.id, bookId), bookAccessCondition(userId)),
				columns: { id: true },
			});
			if (!readableBook)
				throw new UnavailableTaleSelectionError("Book unavailable");
		}
		if (newBookTitle) {
			let authorId = selectedAuthorId;
			if (newAuthorName) {
				const [author] = await tx
					.insert(authors)
					.values({
						creatorId: userId,
						fullName: newAuthorName,
						visibility: "private",
					})
					.returning({ id: authors.id });
				if (!author) throw new Error("Unable to create author");
				authorId = author.id;
			} else if (authorId !== null) {
				const readableAuthor = await tx.query.authors.findFirst({
					where: and(eq(authors.id, authorId), authorAccessCondition(userId)),
					columns: { id: true },
				});
				if (!readableAuthor)
					throw new UnavailableTaleSelectionError("Author unavailable");
			}
			const [book] = await tx
				.insert(books)
				.values({
					title: newBookTitle,
					authorId,
					creatorId: userId,
					visibility: "private",
				})
				.returning({ id: books.id });
			if (!book) throw new Error("Unable to create book");
			bookId = book.id;
		}
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

		const [createdScene] = await tx
			.insert(scenes)
			.values({
				taleId: createdTale.id,
				branchId: createdBranch.id,
				creatorId: userId,
				isOfficial,
				isVerified,
				editable,
				title,
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
						active: { tracks: [] },
					},
					activeLength: 800,
					activeLengthMode: "manual",
				},
				styleConfig: {
					backgroundCss: "var(--background)",
					color: "var(--foreground)",
				},
				visibility,
				cloneable,
			})
			.returning({ id: scenes.id });

		if (!createdScene) throw new Error("Unable to create starter block");

		const [createdFrame] = await tx
			.insert(frames)
			.values({
				taleId: createdTale.id,
				sceneId: createdScene.id,
				creatorId: userId,
				stableId: "frame-1",
				name: "Frame 1",
				isRoot: false,
				order: 0,
				config: {
					children: [],
					gap: 0,
					id: "root",
					mode: "flex",
					overflow: "visible",
					parentFrameId: null,
				},
				styleConfig: {
					alignItems: "center",
					flexDirection: "column",
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
			.returning({ id: frames.id });

		if (!createdFrame) throw new Error("Unable to create root node");

		const [createdTitle] = await tx
			.insert(elements)
			.values({
				taleId: createdTale.id,
				sceneId: createdScene.id,
				frameId: createdFrame.id,
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
			.returning({ id: elements.id });

		if (!createdTitle) throw new Error("Unable to create starter fragment");
		const [introduction] = await tx
			.insert(elements)
			.values({
				taleId: createdTale.id,
				sceneId: createdScene.id,
				frameId: createdFrame.id,
				creatorId: userId,
				type: "text",
				isOfficial,
				isVerified,
				editable,
				order: 1,
				visibility,
				cloneable,
				data: {
					content:
						"Your new tale begins here. Open the Studio to write your first moment and bring your story to life.",
				},
				styleConfig: {
					fontSize: "1.125rem",
					lineHeight: 1.6,
					maxWidth: "42rem",
					textAlign: "center",
				},
			})
			.returning({ id: elements.id });
		if (!introduction) throw new Error("Unable to create introduction");

		await tx
			.update(frames)
			.set({
				config: {
					children: [
						{ elementId: String(createdTitle.id), type: "element" },
						{ elementId: String(introduction.id), type: "element" },
					],
					gap: 24,
					id: String(createdFrame.id),
					mode: "flex",
					overflow: "visible",
					parentFrameId: null,
				},
			})
			.where(eq(frames.id, createdFrame.id));

		await tx.insert(keyframes).values({
			taleId: createdTale.id,
			sceneId: createdScene.id,
			frameId: createdFrame.id,
			creatorId: userId,
			branchId: createdBranch.id,
			pageId: createdPage.id,
			title: "Opening keyframe",
			order: 0,
			actions: [
				{
					id: "opening-title",
					targetId: String(createdTitle.id),
					targetType: "element",
					type: "active",
				},
				{
					id: "opening-introduction",
					targetId: String(introduction.id),
					targetType: "element",
					type: "active",
				},
			],
		});
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
