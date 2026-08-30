import type { Metadata } from "next";
import { getStudioTaleTitle } from "~/server/db/data/tale-reader/queries/tales";

type TaleEditorLayoutProps = Readonly<{
	children: React.ReactNode;
	params: Promise<{ taleId: string }>;
}>;

export async function generateMetadata({
	params,
}: TaleEditorLayoutProps): Promise<Metadata> {
	const { taleId } = await params;
	const title = await getStudioTaleTitle(Number(taleId));

	return {
		description: "Edit and compose an interactive tale in Tale Studio.",
		title: title
			? `${title} | Editor | Talescape Studio`
			: "Editor | Talescape Studio",
	};
}

export default function TaleEditorLayout({
	children,
}: TaleEditorLayoutProps): React.JSX.Element {
	return <>{children}</>;
}
