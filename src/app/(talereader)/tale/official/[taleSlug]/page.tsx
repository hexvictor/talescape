import { notFound, useParams } from "next/navigation";
import { TaleReader } from "~/features/talereader/components";
import LoadingPage from "~/features/talereader/components/LoadingTale";
import { getOfficialTaleBySlug } from "~/server/db/queries/taleReader/tales";
import { TaleAccessError } from "~/lib/errors/taleAccess";
import TaleNotFound from "~/features/talereader/components/TaleNotFound";
import type { TaleParams } from "~/types/tale-reader/talePage";

type PageProps = {
  params: { taleSlug: string };
};

export default async function OfficialTalePage({ params }: PageProps) {
  // const { taleSlug } = useParams() as TaleParams;
  const { taleSlug } = await params;
  if (taleSlug) {
    try {
      const { tale, progress } = await getOfficialTaleBySlug(taleSlug);
      if (!tale) {
        return <TaleNotFound />;
      }

      return (
        <LoadingPage>
          <TaleReader tale={tale} progress={progress} />
        </LoadingPage>
      );
    } catch (error) {
      if (error instanceof TaleAccessError && error.status === 404) {
        return <TaleNotFound />;
      }

      // Optional: log unexpected errors
      console.error("Unexpected error loading official tale:", error);
      return <TaleNotFound />;
    }
  }
  return <TaleNotFound />;
}
