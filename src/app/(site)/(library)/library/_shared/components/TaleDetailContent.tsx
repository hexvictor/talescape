import {
	ArrowUpRight,
	BookOpen,
	Box,
	FileText,
	GitBranch,
	Route,
} from "lucide-react";
import Link from "next/link";
import { Badge, StatusBadge, Tag } from "~/components/data-display/badge";
import { ComicPanel, ComicRail } from "~/components/layout/comic-panel";
import { Button } from "~/components/ui/button";
import cn from "~/lib/utils/cn";
import type { LibraryTaleDetail } from "~/server/db/data/library/queries";
import { LibraryBreadcrumbs } from "./LibraryBreadcrumbs";
import { LibraryNodeList } from "./LibraryNodeList";
import { getFragmentPreview } from "./LibraryNodePanels";
import { createTaleFrameRows } from "./createTaleFrameRows";
import { type TaleDetailView, taleDetailViews } from "./taleDetailViews";
import { getTaleReaderHref, getTaleStudioHref } from "./taleHref";

/**
 * Renders tale metadata, metrics, overview, and the selected structure listing.
 *
 * @param props - Tale detail data and active structure view.
 * @returns Library tale detail page content.
 *
 * @example
 * <TaleDetailContent detail={detail} activeView="overview" />
 */
export function TaleDetailContent({
	detail,
	activeView,
}: {
	detail: LibraryTaleDetail;
	activeView: TaleDetailView;
}) {
	return (
		<div className="mx-auto flex w-full max-w-7xl flex-col gap-5 py-2">
			<LibraryBreadcrumbs
				items={[
					{ label: "Library", href: "/library" },
					{ label: detail.tale.title },
				]}
			/>
			<TaleHeader detail={detail} />
			<TaleMetrics detail={detail} />
			<TaleStructureNav detail={detail} activeView={activeView} />
			{activeView === "overview" ? (
				<TaleOverviewPanels detail={detail} />
			) : (
				<TaleFramePanel detail={detail} view={activeView} />
			)}
		</div>
	);
}

function TaleHeader({ detail }: { detail: LibraryTaleDetail }) {
	const readerHref = getTaleReaderHref(detail.tale);
	const studioHref = getTaleStudioHref(detail.tale);

	return (
		<ComicPanel
			accent="primary"
			className="flex flex-col justify-between gap-5 p-6 sm:p-8 lg:flex-row lg:items-end"
			decoration="strikes"
			shape="cut-opposite"
		>
			<div>
				<ComicRail accent="primary">{detail.tale.accessLabel} tale</ComicRail>
				<h1 className="mt-5 text-balance font-display text-4xl uppercase sm:text-6xl">
					{detail.tale.title}
				</h1>
				<p className="mt-3 max-w-3xl text-muted-foreground leading-7">
					{detail.tale.description}
				</p>
				<div className="mt-4 flex flex-wrap gap-2">
					<Tag>{detail.tale.type}</Tag>
					<StatusBadge status={detail.tale.status} />
					<Tag>{detail.tale.visibility}</Tag>
					{detail.tale.book ? (
						<Badge asChild variant="outline">
							<Link href={`/library/book/${detail.tale.book.id}`}>
								{detail.tale.book.title}
							</Link>
						</Badge>
					) : null}
				</div>
			</div>
			<div className="grid gap-2 sm:min-w-44">
				{readerHref ? (
					<Button asChild size="lg">
						<Link href={readerHref}>
							<ArrowUpRight aria-hidden="true" />
							View tale
						</Link>
					</Button>
				) : null}
				{studioHref ? (
					<Button asChild size="sm" variant="outline">
						<Link href={studioHref}>Edit tale</Link>
					</Button>
				) : null}
				<Button asChild size="sm" variant="ghost">
					<Link href="/library">Library</Link>
				</Button>
			</div>
		</ComicPanel>
	);
}

function TaleMetrics({ detail }: { detail: LibraryTaleDetail }) {
	const metrics = [
		["Branches", detail.tale.nodeCounts.branches],
		["Scenes", detail.tale.nodeCounts.scenes],
		["Elements", detail.tale.nodeCounts.elements],
		["Paths", detail.tale.nodeCounts.paths],
		["Parts", detail.tale.nodeCounts.parts],
		["Entries", detail.tale.nodeCounts.entries],
		["Pages", detail.tale.nodeCounts.pages],
	];

	return (
		<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{metrics.map(([label, value], index) => (
				<ComicPanel
					accent={index % 2 === 0 ? "secondary" : "accent"}
					as="div"
					className="p-5"
					key={label}
					shape={index % 2 === 0 ? "corner-top-right" : "corner-bottom-left"}
					slant="12px"
				>
					<p className="text-muted-foreground text-sm">{label}</p>
					<p className="mt-1 font-display text-3xl">{value}</p>
				</ComicPanel>
			))}
		</section>
	);
}

function TaleStructureNav({
	detail,
	activeView,
}: {
	detail: LibraryTaleDetail;
	activeView: TaleDetailView;
}) {
	const counts: Record<TaleDetailView, number | null> = {
		overview: null,
		branches: detail.tale.nodeCounts.branches,
		scenes: detail.tale.nodeCounts.scenes,
		elements: detail.tale.nodeCounts.elements,
		paths: detail.tale.nodeCounts.paths,
		parts: detail.tale.nodeCounts.parts,
		entries: detail.tale.nodeCounts.entries,
		pages: detail.tale.nodeCounts.pages,
	};

	return (
		<nav
			aria-label="Tale structure views"
			className="scrollbar-none overflow-x-auto"
		>
			<div className="flex min-w-max gap-2 border-2 border-foreground bg-card p-2 shadow-[3px_3px_0_var(--comic-ink)]">
				{taleDetailViews.map((view) => {
					const isActive = view.key === activeView;

					return (
						<Link
							key={view.key}
							href={
								view.key === "overview"
									? `/library/tale/${detail.tale.id}`
									: `/library/tale/${detail.tale.id}?view=${view.key}`
							}
							aria-current={isActive ? "page" : undefined}
							className={cn(
								"inline-flex h-9 items-center gap-2 px-3 font-black text-xs uppercase transition-colors",
								isActive
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
							)}
						>
							{view.label}
							{counts[view.key] !== null ? (
								<span
									className={cn(
										"border border-current px-1.5 py-0.5 text-xs",
										isActive ? "bg-primary-foreground/15" : "bg-muted",
									)}
								>
									{counts[view.key]}
								</span>
							) : null}
						</Link>
					);
				})}
			</div>
		</nav>
	);
}

function TaleOverviewPanels({ detail }: { detail: LibraryTaleDetail }) {
	return (
		<>
			<section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
				<ReaderPath detail={detail} />
				<NarrativeSpine detail={detail} />
			</section>
			<PathsOverview detail={detail} />
		</>
	);
}

function ReaderPath({ detail }: { detail: LibraryTaleDetail }) {
	return (
		<ComicPanel accent="secondary" className="p-6" shape="corner-top-right">
			<div className="flex items-center gap-2">
				<GitBranch aria-hidden="true" className="size-4 text-primary" />
				<h2 className="font-semibold text-xl">Reader path</h2>
			</div>
			<div className="mt-4 grid gap-4">
				{detail.branches.map((branch) => {
					const branchBlocks = detail.scenes.filter(
						(block) => block.branchId === branch.id,
					);

					return (
						<div
							key={branch.id}
							id={`branch-${branch.id}`}
							className="border-secondary border-l-4 bg-muted p-4"
						>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<h3 className="font-semibold">{branch.name}</h3>
								<Badge variant="outline">Branch {branch.index + 1}</Badge>
							</div>
							<div className="mt-3 grid gap-2 border border-foreground/25 bg-background p-3">
								{branchBlocks.map((block) => (
									<BlockRow
										key={block.id}
										block={block}
										elements={detail.elements.filter(
											(element) => element.sceneId === block.id,
										)}
									/>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</ComicPanel>
	);
}

function NarrativeSpine({ detail }: { detail: LibraryTaleDetail }) {
	return (
		<ComicPanel accent="primary" className="p-6" shape="corner-bottom-left">
			<div className="flex items-center gap-2">
				<BookOpen aria-hidden="true" className="size-4 text-primary" />
				<h2 className="font-semibold text-xl">Narrative spine</h2>
			</div>
			<div className="mt-4 grid gap-4">
				{detail.parts.map((part) => {
					const partEntries = detail.entries.filter(
						(entry) => entry.partId === part.id,
					);

					return (
						<div
							key={part.id}
							id={`part-${part.id}`}
							className="border-primary border-l-4 bg-muted p-4"
						>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<h3 className="font-semibold">{part.title}</h3>
								<Badge variant="outline">Part {part.index + 1}</Badge>
							</div>
							<div className="mt-3 grid gap-3">
								{partEntries.map((entry) => (
									<div
										key={entry.id}
										id={`entry-${entry.id}`}
										className="border border-foreground/25 bg-background p-3"
									>
										<div className="flex flex-wrap items-center gap-2">
											<FileText
												aria-hidden="true"
												className="size-4 text-primary"
											/>
											<p className="font-medium text-sm">{entry.title}</p>
											<Badge variant="secondary">{entry.type}</Badge>
										</div>
										<div className="mt-3 flex flex-wrap gap-2">
											{detail.pages
												.filter((page) => page.entryId === entry.id)
												.map((page) => (
													<Badge
														key={page.id}
														id={`page-${page.id}`}
														variant="outline"
													>
														Page {page.index + 1}
													</Badge>
												))}
										</div>
									</div>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</ComicPanel>
	);
}

function BlockRow({
	block,
	elements,
}: {
	block: LibraryTaleDetail["scenes"][number];
	elements: LibraryTaleDetail["elements"];
}) {
	return (
		<div
			id={`block-${block.id}`}
			className="border border-foreground/35 bg-card p-3"
		>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Box aria-hidden="true" className="size-4 text-primary" />
					<p className="font-medium text-sm">Scene {block.index + 1}</p>
				</div>
				<div className="flex flex-wrap gap-2">
					{block.page ? (
						<Badge variant="outline">Page {block.page.index + 1}</Badge>
					) : (
						<Badge variant="outline">Unpaged</Badge>
					)}
					<Badge variant="secondary">{elements.length} elements</Badge>
				</div>
			</div>
			<div className="mt-2 grid gap-2">
				{elements.map((element) => (
					<p
						key={element.id}
						id={`element-${element.id}`}
						className="line-clamp-2 border-foreground/20 border-l-2 bg-muted px-3 py-2 text-muted-foreground text-sm"
					>
						{getFragmentPreview(element.data)}
					</p>
				))}
			</div>
		</div>
	);
}

function PathsOverview({ detail }: { detail: LibraryTaleDetail }) {
	return (
		<ComicPanel accent="accent" className="p-6" shape="corners-right">
			<div className="flex items-center gap-2">
				<Route aria-hidden="true" className="size-4 text-primary" />
				<h2 className="font-semibold text-xl">Paths</h2>
			</div>
			{detail.paths.length ? (
				<div className="mt-4 grid gap-3">
					{detail.paths.map((path) => (
						<div
							key={path.id}
							id={`path-${path.id}`}
							className="flex flex-col gap-2 border-accent border-l-4 bg-muted p-3 sm:flex-row sm:items-center sm:justify-between"
						>
							<p className="font-medium">
								{path.fromBranch?.name ?? "Start"}
								{" -> "}
								{path.toBranch?.name ?? "End"}
							</p>
							<div className="flex flex-wrap gap-2">
								<Badge variant="secondary">{path.type}</Badge>
								{path.label ? (
									<Badge variant="outline">{path.label}</Badge>
								) : null}
							</div>
						</div>
					))}
				</div>
			) : (
				<p className="mt-4 text-muted-foreground text-sm">
					This tale does not have visible branch paths yet.
				</p>
			)}
		</ComicPanel>
	);
}

function TaleFramePanel({
	detail,
	view,
}: {
	detail: LibraryTaleDetail;
	view: Exclude<TaleDetailView, "overview">;
}) {
	const rows = createTaleFrameRows(detail, view);
	const emptyTitle = `No ${view} visible`;

	return <LibraryNodeList emptyTitle={emptyTitle} rows={rows} />;
}
