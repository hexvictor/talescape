import type { Metadata } from "next";
import { getStudioTaleTitle } from "~/server/db/data/tale-reader/queries/tales";

type TalePreviewLayoutProps = Readonly<{
	children: React.ReactNode;
	params: Promise<{ taleId: string }>;
}>;

export async function generateMetadata({
	params,
}: TalePreviewLayoutProps): Promise<Metadata> {
	const { taleId } = await params;
	const title = await getStudioTaleTitle(Number(taleId));

	return {
		description: "Preview an interactive tale in Tale Studio.",
		title: title
			? `${title} | Preview | Talescape Studio`
			: "Preview | Talescape Studio",
	};
}

export default function TalePreviewLayout({
	children,
}: TalePreviewLayoutProps): React.JSX.Element {
	return <>{children}</>;
}
