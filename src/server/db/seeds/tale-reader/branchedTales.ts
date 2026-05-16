export const branchedTaleSlugs = [
	"official-tale-branched",
	"official-tale-branched-snap-off",
	"official-tale-branched-snap-on",
] as const;

const branchedTaleSlugSet = new Set<string>(branchedTaleSlugs);

export function isBranchedTaleSlug(slug: string) {
	return branchedTaleSlugSet.has(slug);
}

export function getTaleBlockSnapOverride(slug: string) {
	if (slug.endsWith("-snap-off")) return false;
	if (slug.endsWith("-snap-on")) return true;
	return null;
}
