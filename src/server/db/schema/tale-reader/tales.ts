import { type InferSelectModel, relations, sql } from "drizzle-orm";
import type {
	FirstSceneTransitionMode,
	TaleBackgroundConfig,
	TalePlaybackConfig,
	TaleSnapConfig,
} from "~/app/(tale-app)/_shared/types";
import type { TaleBreakpoint } from "~/app/(tale-app)/_shared/types";
import { createTable } from "~/server/db/schema-helpers";
import type {
	AssetAccessLevel,
	AssetStatus,
	AssetVisibility,
} from "~/server/db/types/tale-builder/asset";
import type { TaleType } from "~/server/db/types/tale-reader/tale";
import { books } from "../library/books";
import { users } from "../users";
import { branches } from "./layout-structure/branches";
import { elements } from "./layout-structure/elements";
import { frames } from "./layout-structure/frames";
import { paths } from "./layout-structure/paths";
import { scenes } from "./layout-structure/scenes";
import { keyframes } from "./layout-structure/keyframes";
import { entries } from "./narrative-structure/entries";
import { pages } from "./narrative-structure/pages";
import { parts } from "./narrative-structure/parts";
import { talePermissions } from "./permissions/talePermissions";
import { taleProgresses } from "./taleProgresses";

export const tales = createTable("tale", (d) => ({
	id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
	creatorId: d
		.text()
		.notNull()
		.references(() => users.id),
	bookId: d.integer().references(() => books.id),
	title: d.text().notNull(),
	slug: d.text().notNull(),
	description: d.text().notNull(),
	isOfficial: d.boolean().notNull().default(false),
	isVerified: d.boolean().notNull().default(false),
	editable: d.boolean().notNull().default(true),
	visibility: d.text().notNull().$type<AssetVisibility>().default("public"),
	status: d.text().notNull().$type<AssetStatus>().default("draft"),
	cloneable: d.text().notNull().$type<AssetAccessLevel>().default("private"),
	type: d.text().notNull().$type<TaleType>(),
	firstSceneTransitionMode: d
		.text()
		.notNull()
		.$type<FirstSceneTransitionMode>()
		.default("fromPlacement"),
	breakpointConfig: d.json().notNull().$type<TaleBreakpoint[]>().default([]),
	backgroundConfig: d
		.json()
		.notNull()
		.$type<TaleBackgroundConfig>()
		.default({
			dark: { color: "#070a0c", imageUrl: null },
			light: { color: "#fff8e8", imageUrl: null },
		}),
	playbackConfig: d
		.json()
		.notNull()
		.$type<TalePlaybackConfig>()
		.default({
			autoplay: {
				enabled: false,
				speed: 52,
				stopOn: { dragging: true, keyboard: true, scrolling: true },
			},
			interactions: { dragging: true, keyboard: true, scrolling: true },
		}),
	snapConfig: d
		.json()
		.notNull()
		.$type<TaleSnapConfig>()
		.default({
			scrollSnap: {
				captureDistancePx: 96,
				delayMs: 240,
				durationSeconds: 0.22,
				minViewportFraction: null,
			},
			snap: {
				captureDistancePx: 96,
				delayMs: 0,
				durationSeconds: 0.22,
				minViewportFraction: null,
			},
		}),
	createdAt: d
		.timestamp({ withTimezone: true })
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
}));

export const talesRelations = relations(tales, ({ one, many }) => ({
	creatorById: one(users, {
		fields: [tales.creatorId],
		references: [users.id],
	}),
	book: one(books, {
		fields: [tales.bookId],
		references: [books.id],
	}),
	parts: many(parts),
	entries: many(entries),
	pages: many(pages),
	branches: many(branches),
	paths: many(paths),
	scenes: many(scenes),
	elements: many(elements),
	frames: many(frames),
	keyframes: many(keyframes),
	permissions: many(talePermissions),
	progresses: many(taleProgresses),
}));

export type TaleSchema = InferSelectModel<typeof tales>;
