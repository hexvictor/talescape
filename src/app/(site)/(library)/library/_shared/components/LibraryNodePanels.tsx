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
						description={`Rendered from the first readable element in ${branch.tale.title}.`}
						element={branch.previewFragment}
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

export function BlocksPanel({ scenes }: { scenes: LibraryBlockList }) {
	return (
		<LibraryNodeList
			emptyTitle="No scenes visible"
			rows={scenes.map((block) => ({
				id: block.id,
				icon: <Box aria-hidden="true" className="size-4" />,
				title: `Scene ${block.index + 1}`,
				meta: block.tale.title,
				detail: `${block.entry?.title ?? "Unassigned entry"} - ${
					block.page ? `Page ${block.page.index + 1}` : "Unpaged beat"
				}`,
				badges: compactLabels([block.visibility, block.part?.title ?? null]),
				preview: (
					<LibraryReaderPreview
						title={`Preview block ${block.index + 1}`}
						description={`Rendered as a reader element from ${block.entry?.title ?? "an unassigned entry"}.`}
						element={block.previewFragment}
					/>
				),
				links: compactLinks([
					taleLink(block.taleId),
					structureLink("Branch", block.taleId, "branches", block.branch.id),
					structureLink("Scene", block.taleId, "scenes", block.id),
					block.part?.id != null
						? structureLink("Part", block.taleId, "parts", block.part.id)
						: null,
					block.entry?.id != null
						? structureLink("Entry", block.taleId, "entries", block.entry.id)
						: null,
					block.page
						? structureLink("Page", block.taleId, "pages", block.page.id)
						: null,
				]),
			}))}
		/>
	);
}

export function FragmentsPanel({
	elements,
}: {
	elements: LibraryFragmentList;
}) {
	return (
		<LibraryNodeList
			emptyTitle="No elements visible"
			rows={elements.map((element) => ({
				id: element.id,
				icon: <FileText aria-hidden="true" className="size-4" />,
				title: `${capitalize(element.type)} element`,
				meta: element.tale.title,
				detail: getFragmentPreview(element.data),
				badges: [
					element.visibility,
					`Scene ${element.scene.index + 1}`,
					`Element ${element.index + 1}`,
				],
				preview: (
					<LibraryReaderPreview
						title={`Preview ${element.type} element`}
						description={`Rendered as it appears inside ${element.tale.title}.`}
						element={element.previewElement}
					/>
				),
				links: compactLinks([
					taleLink(element.taleId),
					structureLink(
						"Branch",
						element.taleId,
						"branches",
						element.branch.id,
					),
					structureLink("Scene", element.taleId, "scenes", element.scene.id),
					structureLink("Element", element.taleId, "elements", element.id),
					element.part?.id != null
						? structureLink("Part", element.taleId, "parts", element.part.id)
						: null,
					element.entry?.id != null
						? structureLink(
								"Entry",
								element.taleId,
								"entries",
								element.entry.id,
							)
						: null,
					element.page
						? structureLink("Page", element.taleId, "pages", element.page.id)
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

	return "Structured element data";
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

function compactLabels(labels: Array<string | null | undefined>) {
	return labels.filter((label): label is string => Boolean(label));
}

function singularize(view: string) {
	if (view === "branches") return "branch";
	if (view === "entries") return "entry";
	return view.endsWith("s") ? view.slice(0, -1) : view;
}
