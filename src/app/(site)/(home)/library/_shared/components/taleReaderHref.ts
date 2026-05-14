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

	return `/u/${tale.creatorById.username}/${tale.slug}`;
}
