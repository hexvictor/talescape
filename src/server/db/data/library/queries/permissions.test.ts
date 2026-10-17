import { describe, expect, it } from "vitest";
import { canEditLibraryResource, canReadLibraryResource } from "./permissions";

const privateResource = {
	creatorId: "owner",
	visibility: "private",
	editable: true,
	permissions: [{ userId: "invited", permissionTypes: ["viewer"] }],
};

describe("library access", () => {
	it("does not share one user's grant with another signed-in user", () => {
		expect(canReadLibraryResource(privateResource, "stranger")).toBe(false);
		expect(canReadLibraryResource(privateResource, "invited")).toBe(true);
		expect(canReadLibraryResource(privateResource, "owner")).toBe(true);
		expect(canReadLibraryResource(privateResource, null)).toBe(false);
	});
	it("requires public visibility for anonymous access", () => {
		const officialResource = { ...privateResource, isOfficial: true };
		expect(canReadLibraryResource(officialResource, null)).toBe(false);
		expect(
			canReadLibraryResource(
				{ ...privateResource, visibility: "public" },
				null,
			),
		).toBe(true);
	});
	it("only allows owners and collaborators to edit an editable resource", () => {
		expect(canEditLibraryResource(privateResource, "owner")).toBe(true);
		expect(canEditLibraryResource(privateResource, "invited")).toBe(false);
		const collaborative = {
			...privateResource,
			permissions: [{ userId: "invited", permissionTypes: ["collaborator"] }],
		};
		expect(canEditLibraryResource(collaborative, "invited")).toBe(true);
		expect(
			canEditLibraryResource({ ...collaborative, editable: false }, "invited"),
		).toBe(false);
	});
});
