import { BookOpen, Box, FileText, GitBranch, Route } from "lucide-react";
import type { LibraryTaleDetail } from "~/server/db/data/library/queries";
import type { NodeLink, NodeRow } from "./LibraryNodeList";
import { capitalize, getFragmentPreview } from "./LibraryNodePanels";
import type { TaleDetailView } from "./taleDetailViews";

/**
 * Builds presentational rows for one tale structure view.
 *
 * @param detail - Fully authorized library tale detail.
 * @param view - Structure collection to represent.
 * @returns Rows consumed by the generic library node list.
 *
 * @example
 * const rows = createTaleNodeRows(detail, "branches");
 */
export function createTaleNodeRows(
	detail: LibraryTaleDetail,
	view: Exclude<TaleDetailView, "overview">,
): NodeRow[] {
	if (view === "branches") {
		return detail.branches.map((branch) => ({
			id: branch.id,
			anchorId: `branch-${branch.id}`,
			icon: <GitBranch aria-hidden="true" className="size-4" />,
			title: branch.name,
			meta: detail.tale.title,
			detail: `Index ${branch.index}`,
			badges: [branch.visibility, branch.editable ? "editable" : "locked"],
			links: [taleLink(detail.tale.id)],
		}));
	}

	if (view === "blocks") {
		return detail.blocks.map((block) => ({
			id: block.id,
			anchorId: `block-${block.id}`,
			icon: <Box aria-hidden="true" className="size-4" />,
			title: `Block ${block.index + 1}`,
			meta: detail.tale.title,
			detail: `${block.entry?.title ?? "Entry"} - ${
				block.page ? `Page ${block.page.index + 1}` : "Unpaged beat"
			}`,
			badges: [block.visibility, block.part?.title ?? "Part"],
			links: compactLinks([
				taleLink(detail.tale.id),
				block.branch
					? structureLink("Branch", detail.tale.id, "branches", block.branch.id)
					: null,
				block.part
					? structureLink("Part", detail.tale.id, "parts", block.part.id)
					: null,
				block.entry
					? structureLink("Entry", detail.tale.id, "entries", block.entry.id)
					: null,
				block.page
					? structureLink("Page", detail.tale.id, "pages", block.page.id)
					: null,
			]),
		}));
	}

	if (view === "fragments") {
		return detail.fragments.map((fragment) => {
			const block = detail.blocks.find((item) => item.id === fragment.blockId);

			return {
				id: fragment.id,
				anchorId: `fragment-${fragment.id}`,
				icon: <FileText aria-hidden="true" className="size-4" />,
				title: `${capitalize(fragment.type)} fragment`,
				meta: detail.tale.title,
				detail: getFragmentPreview(fragment.data),
				badges: [
					fragment.visibility,
					`Block ${fragment.block?.index ?? "?"}`,
					`Fragment ${fragment.index + 1}`,
				],
				links: compactLinks([
					taleLink(detail.tale.id),
					block?.branch
						? structureLink(
								"Branch",
								detail.tale.id,
								"branches",
								block.branch.id,
							)
						: null,
					structureLink("Block", detail.tale.id, "blocks", fragment.blockId),
					block?.part
						? structureLink("Part", detail.tale.id, "parts", block.part.id)
						: null,
					block?.entry
						? structureLink("Entry", detail.tale.id, "entries", block.entry.id)
						: null,
					block?.page
						? structureLink("Page", detail.tale.id, "pages", block.page.id)
						: null,
				]),
			};
		});
	}

	if (view === "paths") {
		return detail.paths.map((path) => ({
			id: path.id,
			anchorId: `path-${path.id}`,
			icon: <Route aria-hidden="true" className="size-4" />,
			title: path.label ?? `${capitalize(path.type)} path`,
			meta: detail.tale.title,
			detail: `${path.fromBranch?.name ?? "Start"} -> ${path.toBranch?.name ?? "End"}`,
			badges: [path.visibility, `Order ${path.order}`],
			links: compactLinks([
				taleLink(detail.tale.id),
				path.fromBranch
					? structureLink(
							"From branch",
							detail.tale.id,
							"branches",
							path.fromBranch.id,
						)
					: null,
				path.toBranch
					? structureLink(
							"To branch",
							detail.tale.id,
							"branches",
							path.toBranch.id,
						)
					: null,
			]),
		}));
	}

	if (view === "parts") {
		return detail.parts.map((part) => ({
			id: part.id,
			anchorId: `part-${part.id}`,
			icon: <BookOpen aria-hidden="true" className="size-4" />,
			title: part.title,
			meta: detail.tale.title,
			detail: `Narrative order ${part.index + 1}`,
			badges: ["part"],
			links: [taleLink(detail.tale.id)],
		}));
	}

	if (view === "entries") {
		return detail.entries.map((entry) => ({
			id: entry.id,
			anchorId: `entry-${entry.id}`,
			icon: <FileText aria-hidden="true" className="size-4" />,
			title: entry.title,
			meta: detail.tale.title,
			detail: `${entry.part?.title ?? "Part"} - ${entry.type}`,
			badges: [`Entry ${entry.index + 1}`],
			links: compactLinks([
				taleLink(detail.tale.id),
				entry.part
					? structureLink("Part", detail.tale.id, "parts", entry.part.id)
					: null,
			]),
		}));
	}

	return detail.pages.map((page) => ({
		id: page.id,
		anchorId: `page-${page.id}`,
		icon: <FileText aria-hidden="true" className="size-4" />,
		title: `Page ${page.index + 1}`,
		meta: detail.tale.title,
		detail: `${page.entry?.title ?? "Entry"} - ${page.type}`,
		badges: [page.isPaginated ? "paginated" : "unpaginated"],
		links: compactLinks([
			taleLink(detail.tale.id),
			page.part
				? structureLink("Part", detail.tale.id, "parts", page.part.id)
				: null,
			page.entry
				? structureLink("Entry", detail.tale.id, "entries", page.entry.id)
				: null,
		]),
	}));
}

function taleLink(taleId: number) {
	return { label: "Tale", href: `/library/tale/${taleId}` };
}

function structureLink(
	label: string,
	taleId: number,
	view: string,
	id: number,
): NodeLink {
	return {
		label,
		href: `/library/tale/${taleId}?view=${view}#${singularize(view)}-${id}`,
	};
}

function compactLinks(links: Array<NodeLink | null>) {
	return links.filter((link): link is NodeLink => link !== null);
}

function singularize(view: string) {
	if (view === "branches") return "branch";
	if (view === "entries") return "entry";
	return view.endsWith("s") ? view.slice(0, -1) : view;
}
