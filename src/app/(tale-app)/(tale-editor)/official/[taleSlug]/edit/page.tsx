import {
	TaleForbidden,
	TaleNotFound,
	TaleUnauthorized,
} from "~/app/(tale-app)/_shared/components";
import { TaleEditor } from "~/app/(tale-app)/(tale-editor)/_shared/components/TaleEditor";
import { TaleAccessError } from "~/server/db/data/tale-reader/errors/taleAccess";
import { getEditableOfficialTale } from "~/server/db/data/tale-reader/queries/tales";

type OfficialTaleEditPageProps = {
	params: Promise<{ taleSlug: string }>;
};

/**
 * Renders the protected editor route for an official tale.
 *
 * @param props - Route props.
 * @param props.params - Dynamic official tale slug.
 * @returns Tale editor or an access feedback screen.
 *
 * @example
 * <OfficialTaleEditPage params={params} />
 */
export default async function OfficialTaleEditPage({
	params,
}: OfficialTaleEditPageProps) {
	const { taleSlug } = await params;

	try {
		const { progress, tale } = await getEditableOfficialTale(taleSlug);
		return <TaleEditor progress={progress} tale={tale} />;
	} catch (error) {
		if (error instanceof TaleAccessError) {
			if (error.status === 404) return <TaleNotFound />;
			if (error.status === 401) {
				return (
					<TaleUnauthorized
						mode="edit"
						creatorUsername="official"
						slug={taleSlug}
						status={401}
					/>
				);
			}
			if (error.status === 403) {
				return (
					<TaleForbidden
						action="edit"
						creatorUsername="official"
						slug={taleSlug}
					/>
				);
			}
		}

		return <TaleNotFound />;
	}
}
