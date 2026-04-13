export type AssetVisibility = "public" | "private" | "unlisted" | "restricted";

export type AssetStatus =
	| "draft"
	| "review"
	| "approved"
	| "rejected"
	| "published"
	| "archived";

export type AssetAccessLevel = "private" | "public" | "shared";
export type AssetPermissionType =
	| "viewer"
	| "embedder"
	| "collaborator"
	| "cloner";
