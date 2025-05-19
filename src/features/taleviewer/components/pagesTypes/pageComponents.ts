import type { FC } from "react";
import type { Page, PageType } from "~/lib/data";
import { BookPage } from "./BookPage";
import { ComicPage } from "./ComicPage";
import { DefaultTalePage } from "./DefaultTalePage";

export type PageComponent = FC<{ page: Page }>;

export const pageComponents: Record<PageType, PageComponent> = {
	book: BookPage,
	comic: ComicPage,
};
