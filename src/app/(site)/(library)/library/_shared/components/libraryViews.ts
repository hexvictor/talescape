export const libraryViews = [
	{ key: "tales", label: "Tales", href: "/library" },
	{ key: "books", label: "Books", href: "/library/books" },
	{ key: "authors", label: "Authors", href: "/library/authors" },
	{ key: "frames", label: "Frames", href: "/library/frames" },
	{ key: "scenes", label: "Scenes", href: "/library/scenes" },
	{ key: "elements", label: "Elements", href: "/library/elements" },
] as const;

export type LibraryView = (typeof libraryViews)[number]["key"];
