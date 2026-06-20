"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import Input from "~/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";
import type { LibraryTaleList } from "~/server/db/data/library/queries";
import { TalesGrid } from "./LibraryCards";

type TaleSortMode = "newest" | "oldest" | "title";

/**
 * Renders searchable and sortable tale results for the public library.
 *
 * @param props - Explorer props.
 * @param props.tales - Tales returned by the library query.
 * @returns Interactive tale explorer.
 *
 * @example
 * <LibraryTalesExplorer tales={tales} />
 */
export function LibraryTalesExplorer({
	tales,
}: {
	tales: LibraryTaleList;
}): React.JSX.Element {
	const [query, setQuery] = useState("");
	const [sortMode, setSortMode] = useState<TaleSortMode>("newest");
	const [status, setStatus] = useState("all");
	const [visibility, setVisibility] = useState("all");
	const filteredTales = useMemo(
		() =>
			filterAndSortTales({
				query,
				sortMode,
				status,
				tales,
				visibility,
			}),
		[query, sortMode, status, tales, visibility],
	);

	return (
		<section className="grid gap-4">
			<div className="grid gap-3 rounded-md border bg-card p-4 shadow-sm lg:grid-cols-[1fr_auto_auto_auto] lg:items-center">
				<div className="relative block">
					<Search
						aria-hidden="true"
						className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-muted-foreground"
					/>
					<Input
						aria-label="Search tales"
						className="pl-9"
						placeholder="Search tales, creators, books, descriptions..."
						value={query}
						onChange={(event) => setQuery(event.target.value)}
					/>
				</div>
				<Select
					value={sortMode}
					onValueChange={(value) => setSortMode(value as TaleSortMode)}
				>
					<SelectTrigger className="w-full lg:w-36">
						<SelectValue placeholder="Sort" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="newest">Newest</SelectItem>
						<SelectItem value="oldest">Oldest</SelectItem>
						<SelectItem value="title">Title</SelectItem>
					</SelectContent>
				</Select>
				<Select value={visibility} onValueChange={setVisibility}>
					<SelectTrigger className="w-full lg:w-36">
						<SelectValue placeholder="Visibility" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All visibility</SelectItem>
						<SelectItem value="public">Public</SelectItem>
						<SelectItem value="restricted">Restricted</SelectItem>
						<SelectItem value="private">Private</SelectItem>
					</SelectContent>
				</Select>
				<Select value={status} onValueChange={setStatus}>
					<SelectTrigger className="w-full lg:w-36">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All status</SelectItem>
						<SelectItem value="draft">Draft</SelectItem>
						<SelectItem value="review">Review</SelectItem>
						<SelectItem value="published">Published</SelectItem>
						<SelectItem value="approved">Approved</SelectItem>
						<SelectItem value="archived">Archived</SelectItem>
					</SelectContent>
				</Select>
			</div>
			<div className="flex items-center justify-between text-muted-foreground text-sm">
				<p>
					{filteredTales.length} of {tales.length} tales
				</p>
				<p>Showing readable library records</p>
			</div>
			<TalesGrid tales={filteredTales} />
		</section>
	);
}

/**
 * Filters and sorts tale rows for the client-side library explorer.
 *
 * @param options - Filter and sort options.
 * @param options.query - Text query.
 * @param options.sortMode - Sort mode.
 * @param options.status - Status filter.
 * @param options.tales - Tales to filter.
 * @param options.visibility - Visibility filter.
 * @returns Filtered and sorted tales.
 *
 * @example
 * const rows = filterAndSortTales({ tales, query: "thorn", sortMode: "title", status: "all", visibility: "all" });
 */
function filterAndSortTales({
	query,
	sortMode,
	status,
	tales,
	visibility,
}: {
	query: string;
	sortMode: TaleSortMode;
	status: string;
	tales: LibraryTaleList;
	visibility: string;
}): LibraryTaleList {
	const normalizedQuery = query.trim().toLowerCase();
	const filtered = tales.filter((tale) => {
		const matchesVisibility =
			visibility === "all" || tale.visibility === visibility;
		const matchesStatus = status === "all" || tale.status === status;
		const searchable = [
			tale.title,
			tale.description,
			tale.type,
			tale.status,
			tale.visibility,
			tale.book?.title,
			tale.creatorById?.username,
			tale.creatorById?.fullName,
		]
			.filter(Boolean)
			.join(" ")
			.toLowerCase();
		return (
			matchesVisibility &&
			matchesStatus &&
			(!normalizedQuery || searchable.includes(normalizedQuery))
		);
	});

	return [...filtered].sort((first, second) => {
		if (sortMode === "title") {
			return first.title.localeCompare(second.title);
		}
		return sortMode === "oldest" ? first.id - second.id : second.id - first.id;
	});
}
