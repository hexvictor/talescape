import { cache } from "react";
import { mockImages } from "~/mocks/mockImages";

const fallbackImage = mockImages[0]?.url ?? "/assets/brand/talescape-logo.png";

export const siteImages = {
	crownOfAsh: "/assets/site/crown-of-ash.png",
	emberCity: "/assets/site/ember-city-light.png",
	lastStarbound: "/assets/site/last-starbound.png",
	moonlessHarbor: "/assets/site/moonless-harbor.png",
} as const;

export const getFeaturedTales = cache(async () => [
	{
		title: "Moonless Harbor",
		meta: "Mystery",
		image: siteImages.moonlessHarbor,
		description:
			"In a port where fog remembers everything, some secrets sink deeper than the ships.",
	},
	{
		title: "The Last Starbound",
		meta: "Sci-fantasy",
		image: siteImages.lastStarbound,
		description:
			"A crew, a promise, and one chance to reach what no explorer has found.",
	},
	{
		title: "Crown of Ash",
		meta: "Fantasy",
		image: siteImages.crownOfAsh,
		description:
			"Empires fall and crowns bleed. The choices of one ruler decide who rises next.",
	},
]);

export const getRecentCodexEntries = cache(async () => [
	"Factions: The Lantern Monks",
	"Artifact: Ashglass Compass",
	"Character: Maerin of the Ninth Bell",
	"Forum thread: Who opened the moon vault?",
]);

export const getCodexEntries = cache(async () => [
	{
		type: "Character",
		title: "Aster Vey, Candle-Knight",
		image: siteImages.emberCity,
		copy: "A disgraced duelist sworn to guard the library doors that only open for unfinished stories.",
	},
	{
		type: "Faction",
		title: "The Ochre Choir",
		image: siteImages.crownOfAsh,
		copy: "A diplomatic order that encodes treaties as songs and hides assassins in the harmony line.",
	},
	{
		type: "Art",
		title: "Map of the Sunken Mile",
		image: siteImages.lastStarbound,
		copy: "Annotated coastlines, vanished towers, monster routes, and three contradictory compass roses.",
	},
	{
		type: "Trivia",
		title: "Seven Names for Dragonfire",
		image: siteImages.moonlessHarbor,
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
