import { cache } from "react";
import { mockImages } from "~/lib/utils/mockImages";

const fallbackImage = mockImages[0]?.url ?? "/favicon.ico";

export const getFeaturedTales = cache(async () => [
	{
		title: "The Ember Index",
		meta: "42 codex entries",
		image: mockImages[19]?.url ?? fallbackImage,
		description:
			"A living archive of crownless kings, oathbound cartographers, and the fire-script that remembers their names.",
	},
	{
		title: "Glass Coast Almanac",
		meta: "18 character dossiers",
		image: mockImages[5]?.url ?? fallbackImage,
		description:
			"Track pirate houses, storm relics, forbidden ports, and the lighthouse that appears only after midnight.",
	},
	{
		title: "Songs Beneath Ardent Vale",
		meta: "7 active reading paths",
		image: mockImages[22]?.url ?? fallbackImage,
		description:
			"Follow the branching notes of a bardic conspiracy through ruins, taverns, archives, and trial courts.",
	},
]);

export const getRecentCodexEntries = cache(async () => [
	"Factions: The Lantern Monks",
	"Artifact: Ashglass Compass",
	"Character: Maerin of the Ninth Bell",
	"Forum thread: Who opened the moon vault?",
]);

export const getLibraryBooks = cache(async () => [
	{
		title: "The Ember Index",
		author: "N. Aurelian Vale",
		status: "Drafting",
		image: mockImages[19]?.url ?? fallbackImage,
		description:
			"A court archivist discovers every forbidden spell has been catalogued in her handwriting.",
	},
	{
		title: "The Glass Coast Almanac",
		author: "Mira Solwen",
		status: "Published",
		image: mockImages[5]?.url ?? fallbackImage,
		description:
			"Pirate houses, drowned bells, and a lighthouse that bargains with ships instead of guiding them.",
	},
	{
		title: "Oaths Under Ardent Vale",
		author: "Jon Thorne",
		status: "Planning",
		image: mockImages[22]?.url ?? fallbackImage,
		description:
			"Five rival orders chase the same prophecy through trial courts, ruins, and masked festivals.",
	},
	{
		title: "Moon Vault Etiquette",
		author: "Ilyra Penn",
		status: "Private",
		image: mockImages[12]?.url ?? fallbackImage,
		description:
			"A polite handbook for thieves, scholars, and anyone invited to rob a celestial archive.",
	},
]);

export const getCodexEntries = cache(async () => [
	{
		type: "Character",
		title: "Aster Vey, Candle-Knight",
		image: mockImages[15]?.url ?? fallbackImage,
		copy: "A disgraced duelist sworn to guard the library doors that only open for unfinished stories.",
	},
	{
		type: "Faction",
		title: "The Ochre Choir",
		image: mockImages[20]?.url ?? fallbackImage,
		copy: "A diplomatic order that encodes treaties as songs and hides assassins in the harmony line.",
	},
	{
		type: "Art",
		title: "Map of the Sunken Mile",
		image: mockImages[3]?.url ?? fallbackImage,
		copy: "Annotated coastlines, vanished towers, monster routes, and three contradictory compass roses.",
	},
	{
		type: "Trivia",
		title: "Seven Names for Dragonfire",
		image: mockImages[12]?.url ?? fallbackImage,
		copy: "A reader-curated glossary of regional names, ritual uses, and one suspicious tavern recipe.",
	},
]);

export const getCodexLinks = cache(async () => [
	"Forum: The Moon Vault Theory",
	"External wiki: Old Veyr Calendar",
	"Reading order: Emberfall side tales",
	"Faction debate: Choir vs. Lanterns",
]);

export function getImage(index: number) {
	return mockImages[index]?.url ?? fallbackImage;
}
