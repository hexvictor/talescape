
import { TaleReader } from "~/features/talereader/components/reader";
import { tale, type Tale } from "~/lib/data";

type PageProps = {
	params: { taleId: string };
};

export default async function TalePage({ params }: PageProps) {
	// const taleData = await getTaleById(params.taleId);
	const taleData: Tale = tale;

	return <TaleReader tale={taleData} />;
}
