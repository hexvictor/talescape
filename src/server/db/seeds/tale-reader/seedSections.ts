import { db } from "~/server/db";
import { sections, type SectionSchema } from "../../schema";
import { userId1 } from "../ids"; // ou ajuste conforme necessário

export async function seedSections() {
	const TALE_COUNT = 9;
	const SECTIONS_PER_TALE = 4;

	const sectionData: Pick<
		SectionSchema,
		| "creatorId"
		| "layout"
		| "orientation"
		| "inputMode"
		| "isOfficial"
		| "editable"
		| "visibility"
		| "embeddable"
		| "cloneable"
		| "status"
	>[] = Array.from({ length: TALE_COUNT * SECTIONS_PER_TALE }).map(
		(_, index) => ({
			creatorId: userId1, // ou null se for desejado
			layout: index % SECTIONS_PER_TALE === 2 ? "reel" : "scroll",
			orientation: "vertical",
			inputMode: ["buttons", "keyboard", "touch"],
			isOfficial: false,
			editable: true,
			visibility: "public",
			embeddable: "public",
			cloneable: "public",
			status: "published",
		}),
	);

	await db.insert(sections).values(sectionData);

	console.log(`✅ Seeded ${sectionData.length} public, published Sections.`);
}
