import {
	ArrowUpRight,
	BookOpen,
	Box,
	FileText,
	GitBranch,
	Route,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import cn from "~/lib/utils/cn";
import type { LibraryTaleDetail } from "~/server/db/data/library/queries";
import { LibraryBreadcrumbs } from "./LibraryBreadcrumbs";
import { LibraryNodeList } from "./LibraryNodeList";
import { capitalize, getFragmentPreview } from "./LibraryNodePanels";
import { createTaleNodeRows } from "./createTaleNodeRows";
import { type TaleDetailView, taleDetailViews } from "./taleDetailViews";
import { getTaleEditorHref, getTaleReaderHref } from "./taleReaderHref";

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
				<TaleNodePanel detail={detail} view={activeView} />
			)}
		</div>
	);
}

function TaleHeader({ detail }: { detail: LibraryTaleDetail }) {
	const readerHref = getTaleReaderHref(detail.tale);
	const editorHref = getTaleEditorHref(detail.tale);

	return (
		<section className="flex flex-col justify-between gap-5 rounded-md border bg-card p-5 shadow-sm sm:p-6 lg:flex-row lg:items-end">
			<div>
				<p className="font-semibold text-primary text-sm uppercase tracking-normal">
					{detail.tale.accessLabel} Tale
				</p>
				<h1 className="mt-2 text-balance font-bold text-3xl sm:text-4xl">
					{detail.tale.title}
				</h1>
				<p className="mt-3 max-w-3xl text-muted-foreground leading-7">
					{detail.tale.description}
				</p>
				<div className="mt-4 flex flex-wrap gap-2">
					<Badge>{detail.tale.type}</Badge>
					<Badge variant="secondary">{detail.tale.status}</Badge>
					<Badge variant="outline">{detail.tale.visibility}</Badge>
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
				{editorHref ? (
					<Button asChild size="sm" variant="outline">
						<Link href={editorHref}>Edit tale</Link>
					</Button>
				) : null}
				<Button asChild size="sm" variant="ghost">
					<Link href="/library">Library</Link>
				</Button>
			</div>
		</section>
	);
}

function TaleMetrics({ detail }: { detail: LibraryTaleDetail }) {
	const metrics = [
		["Branches", detail.tale.nodeCounts.branches],
		["Blocks", detail.tale.nodeCounts.blocks],
		["Fragments", detail.tale.nodeCounts.fragments],
		["Paths", detail.tale.nodeCounts.paths],
		["Parts", detail.tale.nodeCounts.parts],
		["Entries", detail.tale.nodeCounts.entries],
		["Pages", detail.tale.nodeCounts.pages],
	];

	return (
		<section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{metrics.map(([label, value]) => (
				<div key={label} className="rounded-md border bg-card p-4 shadow-sm">
					<p className="text-muted-foreground text-sm">{label}</p>
					<p className="mt-1 font-semibold text-2xl">{value}</p>
				</div>
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
		blocks: detail.tale.nodeCounts.blocks,
		fragments: detail.tale.nodeCounts.fragments,
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
			<div className="flex min-w-max gap-2 rounded-md border bg-card p-2 shadow-sm">
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
								"inline-flex h-9 items-center gap-2 rounded-md px-3 font-medium text-sm transition-colors",
								isActive
									? "bg-primary text-primary-foreground"
									: "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
							)}
						>
							{view.label}
							{counts[view.key] !== null ? (
								<span
									className={cn(
										"rounded-md px-1.5 py-0.5 text-xs",
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
		<section className="rounded-md border bg-card p-5 shadow-sm">
			<div className="flex items-center gap-2">
				<GitBranch aria-hidden="true" className="size-4 text-primary" />
				<h2 className="font-semibold text-xl">Reader path</h2>
			</div>
			<div className="mt-4 grid gap-4">
				{detail.branches.map((branch) => {
					const branchBlocks = detail.blocks.filter(
						(block) => block.branchId === branch.id,
					);

					return (
						<div
							key={branch.id}
							id={`branch-${branch.id}`}
							className="rounded-md bg-muted p-4"
						>
							<div className="flex flex-wrap items-center justify-between gap-2">
								<h3 className="font-semibold">{branch.name}</h3>
								<Badge variant="outline">Branch {branch.index + 1}</Badge>
							</div>
							<div className="mt-3 grid gap-2 rounded-md bg-background p-3">
								{branchBlocks.map((block) => (
									<BlockRow
										key={block.id}
										block={block}
										fragments={detail.fragments.filter(
											(fragment) => fragment.blockId === block.id,
										)}
									/>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}

function NarrativeSpine({ detail }: { detail: LibraryTaleDetail }) {
	return (
		<section className="rounded-md border bg-card p-5 shadow-sm">
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
							className="rounded-md bg-muted p-4"
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
										className="rounded-md bg-background p-3"
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
		</section>
	);
}

function BlockRow({
	block,
	fragments,
}: {
	block: LibraryTaleDetail["blocks"][number];
	fragments: LibraryTaleDetail["fragments"];
}) {
	return (
		<div id={`block-${block.id}`} className="rounded-md border bg-card p-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<Box aria-hidden="true" className="size-4 text-primary" />
					<p className="font-medium text-sm">Block {block.index + 1}</p>
				</div>
				<div className="flex flex-wrap gap-2">
					{block.page ? (
						<Badge variant="outline">Page {block.page.index + 1}</Badge>
					) : (
						<Badge variant="outline">Unpaged</Badge>
					)}
					<Badge variant="secondary">{fragments.length} fragments</Badge>
				</div>
			</div>
			<div className="mt-2 grid gap-2">
				{fragments.map((fragment) => (
					<p
						key={fragment.id}
						id={`fragment-${fragment.id}`}
						className="line-clamp-2 rounded-md bg-muted px-3 py-2 text-muted-foreground text-sm"
					>
						{getFragmentPreview(fragment.data)}
					</p>
				))}
			</div>
		</div>
	);
}

function PathsOverview({ detail }: { detail: LibraryTaleDetail }) {
	return (
		<section className="rounded-md border bg-card p-5 shadow-sm">
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
							className="flex flex-col gap-2 rounded-md bg-muted p-3 sm:flex-row sm:items-center sm:justify-between"
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
		</section>
	);
}

function TaleNodePanel({
	detail,
	view,
}: {
	detail: LibraryTaleDetail;
	view: Exclude<TaleDetailView, "overview">;
}) {
	const rows = createTaleNodeRows(detail, view);
	const emptyTitle = `No ${view} visible`;

	return <LibraryNodeList emptyTitle={emptyTitle} rows={rows} />;
}
