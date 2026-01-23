import { notFound, useParams } from "next/navigation";
import { getUserTale } from "~/server/db/queries/taleReader/tales";
import { TaleAccessError } from "~/features/tale-reader/utils/errors/taleAccess";
import {
  LoadingTale,
  TaleNotFound,
  TaleReader,
  TaleUnauthorized,
} from "~/features/tale-reader/components";
import NewTaleReader from "~/features/tale-reader/components/reader-shell/new-tale-reader";

type PageProps = {
  params: { creatorUsername: string; taleSlug: string };
};

export default async function UserTalePage({ params }: PageProps) {
  // const { creatorUsername, taleSlug } = useParams() as TaleParams;
  const { creatorUsername, taleSlug } = await params;
  if (taleSlug && creatorUsername) {
    try {
      const { tale, progress } = await getUserTale(taleSlug, creatorUsername);

      if (!tale || tale.isOfficial) {
        return <TaleNotFound />;
      }

      return (
        <LoadingTale>
          {/* <NewTaleReader tale={tale} progress={progress} /> */}
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
