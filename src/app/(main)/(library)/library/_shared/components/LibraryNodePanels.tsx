import { BookOpen, Box, FileText, GitBranch, Route } from "lucide-react";
import type {
	LibraryBlockList,
	LibraryBranchList,
	LibraryEntryList,
	LibraryFragmentList,
	LibraryPageList,
	LibraryPartList,
	LibraryPathList,
} from "~/server/db/data/library/queries";
import { LibraryNodeList, type NodeLink } from "./LibraryNodeList";
import { LibraryReaderPreview } from "./LibraryReaderPreview";

export function BranchesPanel({
	branches,
}: {
	branches: LibraryBranchList;
}) {
	return (
		<LibraryNodeList
			emptyTitle="No branches visible"
			rows={branches.map((branch) => ({
				id: branch.id,
				icon: <GitBranch aria-hidden="true" className="size-4" />,
				title: branch.name,
				meta: branch.tale.title,
				detail: `Index ${branch.index}`,
				badges: [branch.visibility, branch.editable ? "editable" : "locked"],
				preview: (
					<LibraryReaderPreview
						title={`Preview branch: ${branch.name}`}
						description={`Rendered from the first readable fragment in ${branch.tale.title}.`}
						fragment={branch.previewFragment}
					/>
				),
				links: [
					taleLink(branch.taleId),
					structureLink("Branch", branch.taleId, "branches", branch.id),
				],
			}))}
		/>
	);
}

export function BlocksPanel({ blocks }: { blocks: LibraryBlockList }) {
	return (
		<LibraryNodeList
			emptyTitle="No blocks visible"
			rows={blocks.map((block) => ({
				id: block.id,
				icon: <Box aria-hidden="true" className="size-4" />,
				title: `Block ${block.index + 1}`,
				meta: block.tale.title,
				detail: `${block.entry.title} - ${
					block.page ? `Page ${block.page.index + 1}` : "Unpaged beat"
				}`,
				badges: [block.visibility, block.part.title],
				preview: (
					<LibraryReaderPreview
						title={`Preview block ${block.index + 1}`}
						description={`Rendered as a reader fragment from ${block.entry.title}.`}
						fragment={block.previewFragment}
					/>
				),
				links: compactLinks([
					taleLink(block.taleId),
					structureLink("Branch", block.taleId, "branches", block.branch.id),
					structureLink("Block", block.taleId, "blocks", block.id),
					structureLink("Part", block.taleId, "parts", block.part.id),
					structureLink("Entry", block.taleId, "entries", block.entry.id),
					block.page
						? structureLink("Page", block.taleId, "pages", block.page.id)
						: null,
				]),
			}))}
		/>
	);
}

export function FragmentsPanel({
	fragments,
}: {
	fragments: LibraryFragmentList;
}) {
	return (
		<LibraryNodeList
			emptyTitle="No fragments visible"
			rows={fragments.map((fragment) => ({
				id: fragment.id,
				icon: <FileText aria-hidden="true" className="size-4" />,
				title: `${capitalize(fragment.type)} fragment`,
				meta: fragment.tale.title,
				detail: getFragmentPreview(fragment.data),
				badges: [
					fragment.visibility,
					`Block ${fragment.block.index + 1}`,
					`Fragment ${fragment.index + 1}`,
				],
				preview: (
					<LibraryReaderPreview
						title={`Preview ${fragment.type} fragment`}
						description={`Rendered as it appears inside ${fragment.tale.title}.`}
						fragment={fragment.previewFragment}
					/>
				),
				links: compactLinks([
					taleLink(fragment.taleId),
					structureLink(
						"Branch",
						fragment.taleId,
						"branches",
						fragment.branch.id,
					),
					structureLink("Block", fragment.taleId, "blocks", fragment.block.id),
					structureLink("Fragment", fragment.taleId, "fragments", fragment.id),
					structureLink("Part", fragment.taleId, "parts", fragment.part.id),
					structureLink("Entry", fragment.taleId, "entries", fragment.entry.id),
					fragment.page
						? structureLink("Page", fragment.taleId, "pages", fragment.page.id)
						: null,
				]),
			}))}
		/>
	);
}

export function PathsPanel({ paths }: { paths: LibraryPathList }) {
	return (
		<LibraryNodeList
			emptyTitle="No paths visible"
			rows={paths.map((path) => ({
				id: path.id,
				icon: <Route aria-hidden="true" className="size-4" />,
				title: path.label ?? `${capitalize(path.type)} path`,
				meta: path.tale.title,
				detail: `${path.fromBranch.name} -> ${path.toBranch.name}`,
				badges: [path.visibility, `Order ${path.order}`],
				links: [
					taleLink(path.taleId),
					structureLink("Path", path.taleId, "paths", path.id),
					structureLink(
						"From branch",
						path.taleId,
						"branches",
						path.fromBranch.id,
					),
					structureLink("To branch", path.taleId, "branches", path.toBranch.id),
				],
			}))}
		/>
	);
}

export function PartsPanel({ parts }: { parts: LibraryPartList }) {
	return (
		<LibraryNodeList
			emptyTitle="No parts visible"
			rows={parts.map((part) => ({
				id: part.id,
				icon: <BookOpen aria-hidden="true" className="size-4" />,
				title: part.title,
				meta: part.tale.title,
				detail: `Narrative order ${part.index + 1}`,
				badges: ["part"],
				links: [
					taleLink(part.taleId),
					structureLink("Part", part.taleId, "parts", part.id),
				],
			}))}
		/>
	);
}

export function EntriesPanel({
	entries,
}: {
	entries: LibraryEntryList;
}) {
	return (
		<LibraryNodeList
			emptyTitle="No entries visible"
			rows={entries.map((entry) => ({
				id: entry.id,
				icon: <FileText aria-hidden="true" className="size-4" />,
				title: entry.title,
				meta: entry.tale.title,
				detail: `${entry.part.title} - ${entry.type}`,
				badges: [`Entry ${entry.index + 1}`],
				links: [
					taleLink(entry.taleId),
					structureLink("Part", entry.taleId, "parts", entry.part.id),
					structureLink("Entry", entry.taleId, "entries", entry.id),
				],
			}))}
		/>
	);
}

export function PagesPanel({ pages }: { pages: LibraryPageList }) {
	return (
		<LibraryNodeList
			emptyTitle="No pages visible"
			rows={pages.map((page) => ({
				id: page.id,
				icon: <FileText aria-hidden="true" className="size-4" />,
				title: `Page ${page.index + 1}`,
				meta: page.tale.title,
				detail: `${page.entry.title} - ${page.type}`,
				badges: [page.isPaginated ? "paginated" : "unpaginated"],
				links: [
					taleLink(page.taleId),
					structureLink("Part", page.taleId, "parts", page.part.id),
					structureLink("Entry", page.taleId, "entries", page.entry.id),
					structureLink("Page", page.taleId, "pages", page.id),
				],
			}))}
		/>
	);
}

export function getFragmentPreview(data: unknown) {
	if (
		typeof data === "object" &&
		data !== null &&
		"content" in data &&
		typeof data.content === "string"
	) {
		return data.content;
	}

	if (
		typeof data === "object" &&
		data !== null &&
		"url" in data &&
		typeof data.url === "string"
	) {
		return data.url;
	}

	return "Structured fragment data";
}

export function capitalize(value: string) {
	return value.charAt(0).toUpperCase() + value.slice(1);
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
