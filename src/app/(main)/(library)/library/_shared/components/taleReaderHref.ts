type TaleReaderTarget = {
	isOfficial: boolean;
	slug: string;
	creatorById?: {
		username: string;
	} | null;
};

export function getTaleReaderHref(tale: TaleReaderTarget) {
	if (tale.isOfficial) {
		return `/official/${tale.slug}`;
	}

	if (!tale.creatorById?.username) {
		return null;
	}

	return `/${tale.creatorById.username}/${tale.slug}`;
}

/**
 * Gets the edit route for a tale reader target.
 *
 * @param tale - Tale row with official/creator route information.
 * @returns Edit route when the reader route can be resolved.
 *
 * @example
 * const href = getTaleEditorHref(tale);
 */
export function getTaleEditorHref(tale: TaleReaderTarget) {
	const readerHref = getTaleReaderHref(tale);
	return readerHref ? `${readerHref}/edit` : null;
}
