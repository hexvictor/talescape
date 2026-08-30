import { TaleStudio } from "~/app/(tale-app)/(studio)/_shared/components/TaleStudio";
import {
	TaleForbidden,
	TaleNotFound,
	TaleUnauthorized,
} from "~/app/(tale-app)/_shared/components";
import { TaleAccessError } from "~/server/db/data/tale-reader/errors/taleAccess";
import { getStudioTale } from "~/server/db/data/tale-reader/queries/tales";

type TaleStudioEditorPageProps = {
	params: Promise<{ taleId: string }>;
};

export default async function TaleStudioEditorPage({
	params,
}: TaleStudioEditorPageProps): Promise<React.JSX.Element> {
	const { taleId: taleIdParam } = await params;
	const taleId = Number(taleIdParam);

	try {
		const { progress, tale } = await getStudioTale(taleId);
		return <TaleStudio progress={progress} tale={tale} workspace="editor" />;
	} catch (error) {
		if (error instanceof TaleAccessError) {
			if (error.status === 401) {
				return (
					<TaleUnauthorized
						action="edit"
						returnTo={`/studio/${taleIdParam}`}
						status={401}
						taleId={Number.isSafeInteger(taleId) ? taleId : undefined}
					/>
				);
			}
			if (error.status === 403) {
				return (
					<TaleForbidden
						action="edit"
						taleId={Number.isSafeInteger(taleId) ? taleId : undefined}
					/>
				);
			}
		}

		return <TaleNotFound />;
	}
}
