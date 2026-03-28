export const revalidate = 60;
import { getOfficialTale } from "~/server/db/queries/taleReader/tales";
import { TaleAccessError } from "~/features/tale-reader/utils/errors/taleAccess";
import {
  LoadingTale,
  TaleNotFound,
  TaleReader,
} from "~/features/tale-reader/components";
type PageProps = {
  params: { taleSlug: string };
};

export default async function OfficialTalePage({ params }: PageProps) {
  // const { taleSlug } = useParams() as TaleParams;
  const { taleSlug } = await params;
  if (taleSlug) {
    try {
      const { tale, progress } = await getOfficialTale(taleSlug);
      if (!tale) {
        return <TaleNotFound />;
      }

      return (
        <LoadingTale>
          <TaleReader tale={tale} progress={progress} />
        </LoadingTale>
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
