import { describe, expect, it } from "vitest";
import { getTaleReaderHref, getTaleStudioHref } from "./taleHref";

describe("taleHref", () => {
	it("uses the stable tale id for Tale Studio", () => {
		expect(
			getTaleStudioHref({
				creatorById: { username: "alex" },
				id: 42,
				isOfficial: false,
				slug: "old-slug",
			}),
		).toBe("/studio/42");
	});

	it("keeps creator and official public Reader routes", () => {
		expect(
			getTaleReaderHref({
				creatorById: { username: "alex" },
				id: 42,
				isOfficial: false,
				slug: "my-tale",
			}),
		).toBe("/alex/my-tale");
		expect(
			getTaleReaderHref({
				id: 7,
				isOfficial: true,
				slug: "official-tale",
			}),
		).toBe("/official/official-tale");
	});
});
