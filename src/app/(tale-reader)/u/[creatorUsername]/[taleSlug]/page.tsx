export const revalidate = 60;

import {
	TaleNotFound,
	TaleUnauthorized,
} from "~/features/tale-reader/components";
import { TaleAccessError } from "~/features/tale-reader/utils/errors/taleAccess";
import { getUserTale } from "~/server/db/data/tale-reader/queries/tales";
import type { UserTalePageProps } from "./types";

export default async function UserTalePage({ params }: UserTalePageProps) {
	const { creatorUsername, taleSlug } = await params;

	if (taleSlug && creatorUsername) {
		try {
			const { tale, progress } = await getUserTale(taleSlug, creatorUsername);

			if (!tale || tale.isOfficial) {
				return <TaleNotFound />;
			}

			return null;
			// return <TaleReader tale={tale} progress={progress} />;
		} catch (error) {
			if (error instanceof TaleAccessError) {
				if (error.status === 404) {
					return <TaleNotFound />;
				}

				if (error.status === 401 || error.status === 403) {
					return (
						<TaleUnauthorized
							slug={taleSlug}
							creatorUsername={creatorUsername}
							status={error.status}
							visibility={error.partialTale?.visibility}
							title={error.partialTale?.title}
							type={error.partialTale?.type}
						/>
					);
				}
			}

			return <TaleNotFound />;
		}
	}

	return <TaleNotFound />;
}
