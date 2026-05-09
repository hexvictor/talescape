"use client";

import { usePathname, useRouter } from "next/navigation";
import { type MouseEvent, useRef } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "~/components/ui/dialog";
import { ScrollArea } from "~/components/ui/scroll-area";

type RouteDialogProps = {
	children: React.ReactNode;
	title: string;
	closeButtonClassName?: string;
	closeWhen?: boolean;
	contentClassName?: string;
	description?: string;
	fallbackHref?: string;
	hideHeader?: boolean;
	replaceHrefs?: string[];
	replaceOnClose?: boolean;
};

export default function RouteDialog({
	children,
	title,
	closeButtonClassName,
	closeWhen = false,
	contentClassName,
	description,
	fallbackHref = "/",
	hideHeader = false,
	replaceHrefs = [],
	replaceOnClose = false,
}: RouteDialogProps) {
	const pathname = usePathname();
	const router = useRouter();
	const openedPathname = useRef(pathname);
	const isCurrentRoute =
		pathname === openedPathname.current ||
		pathname.startsWith(`${openedPathname.current}/`);

	if (closeWhen || !isCurrentRoute) {
		return null;
	}

	const handleOpenChange = (open: boolean) => {
		if (open) {
			return;
		}

		if (window.history.length > 1) {
			if (replaceOnClose) {
				router.replace(fallbackHref);
				return;
			}

			router.back();
			return;
		}

		router.replace(fallbackHref);
	};

	const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
		if (!replaceHrefs.length) return;

		const link = (event.target as HTMLElement).closest<HTMLAnchorElement>(
			"a[href]",
		);
		if (!link) return;

		const url = new URL(link.href);
		const href = `${url.pathname}${url.search}${url.hash}`;
		if (!replaceHrefs.includes(href) && !replaceHrefs.includes(url.pathname)) {
			return;
		}

		event.preventDefault();
		router.replace(href);
	};

	return (
		<Dialog open onOpenChange={handleOpenChange}>
			<DialogContent
				closeButtonClassName={closeButtonClassName}
				className={contentClassName}
				onClickCapture={handleClickCapture}
			>
				{hideHeader ? (
					<DialogTitle className="sr-only">{title}</DialogTitle>
				) : (
					<DialogHeader className="pr-8">
						<DialogTitle>{title}</DialogTitle>
						{description && (
							<DialogDescription>{description}</DialogDescription>
						)}
					</DialogHeader>
				)}
				<ScrollArea className="max-h-[min(78dvh,720px)]">{children}</ScrollArea>
			</DialogContent>
		</Dialog>
	);
}
