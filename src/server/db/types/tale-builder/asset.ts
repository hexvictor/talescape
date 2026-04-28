export type AssetVisibility = "public" | "private" | "restricted";
export type AssetAccessLevel = "private" | "public" | "shared";

export type AssetPermissionType = "viewer" | "collaborator" | "cloner";

export type AssetStatus =
	| "draft"
	| "review"
	| "approved"
	| "rejected"
	| "published"
	| "archived";
