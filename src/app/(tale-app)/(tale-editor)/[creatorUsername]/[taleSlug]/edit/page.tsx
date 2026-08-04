import {
	TaleForbidden,
	TaleNotFound,
	TaleUnauthorized,
} from "~/app/(tale-app)/_shared/components";
import { TaleEditor } from "~/app/(tale-app)/(tale-editor)/_shared/components/TaleEditor";
import { TaleAccessError } from "~/server/db/data/tale-reader/errors/taleAccess";
import { getEditableUserTale } from "~/server/db/data/tale-reader/queries/tales";

type UserTaleEditPageProps = {
	params: Promise<{ creatorUsername: string; taleSlug: string }>;
};

/**
 * Renders the protected editor route for a creator tale.
 *
 * @param props - Route props.
 * @param props.params - Dynamic creator username and tale slug.
 * @returns Tale editor or an access feedback screen.
 *
 * @example
 * <UserTaleEditPage params={params} />
 */
export default async function UserTaleEditPage({
	params,
}: UserTaleEditPageProps) {
	const { creatorUsername, taleSlug } = await params;

	try {
		const { progress, tale } = await getEditableUserTale(
			taleSlug,
			creatorUsername,
		);
		return <TaleEditor progress={progress} tale={tale} />;
	} catch (error) {
		if (error instanceof TaleAccessError) {
			if (error.status === 404) return <TaleNotFound />;
			if (error.status === 401) {
				return (
					<TaleUnauthorized
						mode="edit"
						creatorUsername={creatorUsername}
						slug={taleSlug}
						status={401}
					/>
				);
			}
			if (error.status === 403) {
				return (
					<TaleForbidden
						action="edit"
						creatorUsername={creatorUsername}
						slug={taleSlug}
					/>
				);
			}
		}

		return <TaleNotFound />;
	}
}
