// components/TalePage.tsx

import type { Page } from "~/lib/data";
import { pageComponents } from "../pagesTypes/pageComponents";
import { BookPage } from "../pagesTypes/BookPage";

interface TalePageProps {
	page: Page;
}

export function TalePage({ page }: TalePageProps) {
	const PageComponent = pageComponents[page.type] || BookPage;
	return <PageComponent page={page} />;
}

export default TalePage;
