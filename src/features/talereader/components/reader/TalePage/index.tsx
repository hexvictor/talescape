// components/TalePage.tsx

import type { Page } from "~/lib/data";
import { BookPage, pageComponents } from "../../pages";

interface TalePageProps {
	page: Page;
}

export function TalePage({ page }: TalePageProps) {
	const PageComponent = pageComponents[page.type] || BookPage;
	return <PageComponent page={page} />;
}

export default TalePage;
