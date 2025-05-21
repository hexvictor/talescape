import type { FC } from "react";
import type { Page, PageType } from "~/lib/data";
import BookPage from "./BookPage";
import ComicPage from "./ComicPage";

type PageComponent = FC<{ page: Page }>;
const pageComponents: Record<PageType, PageComponent> = {
	book: BookPage,
	comic: ComicPage,
};
export default pageComponents;
