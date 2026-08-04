const storyParagraphs = [
	"Rain crossed Thornwick in silver sheets while Mara followed the bell's impossible echo through lanes older than the town records. Every doorway carried a different account of the missing names, and every account ended at the sealed stair beneath Saint Orwyn.",
	"The stones remembered footsteps that no living witness admitted hearing. By dusk the market had become a map of absences: an empty pen, a cold forge, a shutter left open, and a line of pale dust leading toward the oldest wall.",
	"Below the wall, the air tasted of salt and extinguished candles. Carved names crowded the arches, but several had been scraped away so completely that even the wounds in the stone seemed afraid to keep their shape.",
	"Mara raised the lantern. Its flame bent toward a corridor where the floor descended in long shallow steps. Somewhere in the dark, water moved against the slope, climbing toward the town instead of falling away from it.",
	"The keeper had warned her that the bell did not call the living. It called the stories that people abandoned when remembering became inconvenient. Each toll returned one detail, and took another in exchange.",
	"She passed alcoves filled with ordinary things: a child's red scarf, a butcher's ledger, a brass key polished by years of anxious hands. None were relics, yet each carried the weight of a confession left unfinished.",
	"When the next toll came, Mara remembered a face she had never seen and forgot the sound of her own front door. The bargain felt small until she tried to picture home and found only a rectangle of warm light without a name.",
	"At the final arch, two roads divided around a pillar wrapped in black rope. One road held the dry glow of lanterns. The other carried the underground river and the faint reflection of stars that could not possibly be above it.",
] as const;

/**
 * Creates deterministic long-form story copy for content-responsive pages.
 *
 * @param title - Page title.
 * @param route - Current branch name.
 * @param extended - Whether to include the full long-form passage.
 * @returns Multi-paragraph seeded story text.
 */
export function createReaderStoryText(
	title: string,
	route: string,
	extended: boolean,
): string {
	const paragraphs = extended ? storyParagraphs : storyParagraphs.slice(0, 3);
	return [
		`${title}. This page follows the ${route} through Thornwick.`,
		...paragraphs,
		...(extended ? storyParagraphs.slice(1, 6) : []),
	].join("\n\n");
}
