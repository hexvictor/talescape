import type { AuthorProps } from "./author";

export type BookProps = {
	id: number;
	title: string;
	authorId: number | null;
	author: AuthorProps | null;
	description: string | null;
	coverImageUrl: string | null;
	type: BookType;
	userId: string | null;
	status: BookStatus;
	createdAt: Date;
	updatedAt: Date | null;
};

export type BookType = "official" | "user";
// "community",
// "fanfiction",
// "translation",
export type BookStatus =
	| "draft"
	| "published"
	| "private"
	| "archived"
	| "deleted";

export type AddBookProps = {
	title: string;
	userId: string | null;
	authorId: number;
	description: string;
	coverImageUrl: string;
	type: BookType;
	status: BookStatus;
};
