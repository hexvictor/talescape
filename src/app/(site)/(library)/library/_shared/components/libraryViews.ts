export const libraryViews = [
	{ key: "tales", label: "Tales", href: "/library" },
	{ key: "books", label: "Books", href: "/library/books" },
	{ key: "authors", label: "Authors", href: "/library/authors" },
	{ key: "frames", label: "Frames", href: "/library/frames" },
] as const;

export type LibraryView = (typeof libraryViews)[number]["key"];
