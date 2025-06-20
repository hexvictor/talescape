import { notFound, useParams } from "next/navigation";
import { TaleReader } from "~/features/talereader/components";
import LoadingTale from "~/features/talereader/components/LoadingTale";
import { getUserTaleBySlug } from "~/server/db/queries/taleReader/tales";
import { TaleAccessError } from "~/lib/errors/taleAccess";
import TaleUnauthorized from "~/features/talereader/components/TaleUnauthorized";
import TaleNotFound from "~/features/talereader/components/TaleNotFound";
import type { TaleParams } from "~/types/tale-reader/talePage";

type PageProps = {
  params: { creatorUsername: string; taleSlug: string };
};

export default async function UserTalePage({ params }: PageProps) {
  // const { creatorUsername, taleSlug } = useParams() as TaleParams;
  const { creatorUsername, taleSlug } = await params;
  if (taleSlug && creatorUsername) {
    try {
      const { tale, progress } = await getUserTaleBySlug(
        taleSlug,
        creatorUsername
      );

      if (!tale || tale.isOfficial) {
        return <TaleNotFound />;
      }

      return (
        <LoadingTale>
          <TaleReader tale={tale} progress={progress} />
        </LoadingTale>
      );
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
