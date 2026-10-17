type ResourcePermission = {
	userId: string;
	permissionTypes: readonly string[];
};
type LibraryResource = {
	creatorId: string | null;
	visibility: string;
	editable?: boolean;
	permissions?: readonly ResourcePermission[];
};

function hasPermission(
	resource: LibraryResource,
	userId: string,
	types: readonly string[],
) {
	return (
		resource.permissions?.some(
			(permission) =>
				permission.userId === userId &&
				permission.permissionTypes.some((type) => types.includes(type)),
		) ?? false
	);
}

export function canReadLibraryResource(
	resource: LibraryResource,
	userId: string | null,
) {
	return (
		resource.visibility === "public" ||
		(userId !== null &&
			(resource.creatorId === userId ||
				hasPermission(resource, userId, ["viewer", "collaborator", "cloner"])))
	);
}

export function canEditLibraryResource(
	resource: LibraryResource,
	userId: string | null,
) {
	return (
		resource.editable === true &&
		userId !== null &&
		(resource.creatorId === userId ||
			hasPermission(resource, userId, ["collaborator"]))
	);
}
