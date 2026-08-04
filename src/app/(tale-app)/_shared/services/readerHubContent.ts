export type ReaderHubContent = {
	art: Array<{ caption: string; credit: string }>;
	codex: Array<{ description: string; name: string; type: string }>;
	comments: Array<{ author: string; body: string }>;
	trivia: string[];
};

/**
 * Creates stable placeholder hub content for a reader page.
 *
 * @param pageId - Current page identifier.
 * @param pageTitle - Current page title or semantic label.
 * @returns Contextual community, art, codex, and trivia data.
 *
 * @example
 * const content = getReaderHubContent("page-1", "The Belfry");
 */
export function getReaderHubContent(
	pageId: string,
	pageTitle: string,
): ReaderHubContent {
	const seed = [...pageId].reduce(
		(total, character) => total + character.charCodeAt(0),
		0,
	);
	const detail = seed % 3;
	return {
		art: [
			{
				caption: `${pageTitle}, interpreted in charcoal and muted ink.`,
				credit: `Community study ${detail + 1}`,
			},
			{
				caption: `An alternate composition focused on the scene's background.`,
				credit: `Reader collection ${detail + 4}`,
			},
		],
		codex: [
			{
				description:
					"A location, character, or object referenced by this part of the tale.",
				name: pageTitle,
				type: "Scene",
			},
			{
				description:
					"Context gathered from earlier visible pages without revealing future branches.",
				name: detail === 0 ? "The Old Bell" : "The Lantern Oath",
				type: detail === 0 ? "Artifact" : "Lore",
			},
		],
		comments: [
			{
				author: "Mara",
				body: "The pacing here changes the meaning of the previous scene.",
			},
			{
				author: "Jon",
				body: "I missed the background detail on my first reading.",
			},
		],
		trivia: [
			"This page is part of the currently selected reader route.",
			`The composition uses ${detail + 2} primary visual layers.`,
			"The authoring view can attach future codex links directly to text ranges.",
		],
	};
}
