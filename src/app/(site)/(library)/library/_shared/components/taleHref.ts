type TaleRouteTarget = {
	id: number;
	isOfficial: boolean;
	slug: string;
	creatorById?: {
		username: string;
	} | null;
};

export function getTaleReaderHref(tale: TaleRouteTarget) {
	if (tale.isOfficial) {
		return `/official/${tale.slug}`;
	}

	if (!tale.creatorById?.username) {
		return null;
	}

	return `/${tale.creatorById.username}/${tale.slug}`;
}

/**
 * Gets the Tale Studio route for a tale.
 *
 * @param tale - Tale row with official/creator route information.
 * @returns Stable id-based Tale Studio route.
 *
 * @example
 * const href = getTaleStudioHref(tale);
 */
export function getTaleStudioHref(tale: TaleRouteTarget) {
	return `/studio/${tale.id}`;
}
