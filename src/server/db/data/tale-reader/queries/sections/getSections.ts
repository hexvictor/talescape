import { cache } from "react";
import { db } from "~/server/db";
import type { EmbeddedSection, SectionEmbed } from "../../types/sections";

export async function getSectionsQuery(
	taleId: number,
): Promise<EmbeddedSection[]> {
	const sectionEmbeds = await db.query.sectionEmbeds.findMany({
		where: (e, { eq }) => eq(e.taleId, taleId),
	});

	const embedMap = new Map<string, SectionEmbed>();
	for (const embed of sectionEmbeds) {
		if (embed.sectionId !== null) {
			embedMap.set(String(embed.sectionId), {
				index: embed.index,
				isSnap: embed.isSnap,
			});
		}
	}

	const sectionIds = Array.from(embedMap.keys()).map(Number);
	const baseSections = await db.query.sections.findMany({
		where: (section, { inArray }) => inArray(section.id, sectionIds),
	});

	return baseSections.map((section) => {
		const embed = embedMap.get(String(section.id));
		if (!embed) throw new Error(`Missing embed data for section ${section.id}`);
		return {
			...section,
			...embed,
		};
	});
}

export const getSections = cache(getSectionsQuery);
