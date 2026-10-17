"use client";

import { Check, File, Film, ImageIcon, Music } from "lucide-react";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { SearchField } from "~/components/ui/search-field";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~/components/ui/select";

export type MediaAsset = {
	id: string;
	name: string;
	kind: "image" | "video" | "audio" | "file";
	url: string;
	thumbnail?: string;
};
export function AssetLibrary({
	assets,
	selectedId,
	onSelect,
	isLoading,
	error,
	isDisabled,
}: {
	assets: MediaAsset[];
	selectedId?: string;
	onSelect: (asset: MediaAsset) => void;
	isLoading?: boolean;
	error?: string;
	isDisabled?: boolean;
}): React.JSX.Element {
	const [search, setSearch] = useState("");
	const [kind, setKind] = useState("all");
	const visible = assets.filter(
		(asset) =>
			(kind === "all" || kind === asset.kind) &&
			asset.name.toLowerCase().includes(search.toLowerCase()),
	);
	const selected = assets.find((a) => a.id === selectedId);
	const icons = { image: ImageIcon, video: Film, audio: Music, file: File };
	return (
		<section
			data-reader-component="AssetLibrary"
			data-reader-role="asset-browser"
			className="grid min-w-0 gap-4"
		>
			<div className="flex flex-wrap items-center gap-3">
				<div className="min-w-40 flex-1">
					<SearchField
						aria-label="Search assets"
						placeholder="Search assets"
						value={search}
						onChange={setSearch}
					/>
				</div>
				<Select aria-label="Asset type" value={kind} onValueChange={setKind}>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{["all", "image", "video", "audio", "file"].map((k) => (
							<SelectItem key={k} value={k}>
								{k === "all" ? "All assets" : k}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
			{isLoading ? (
				<output className="text-sm">Loading assets</output>
			) : error ? (
				<p role="alert" className="text-destructive text-sm">
					{error}
				</p>
			) : visible.length === 0 ? (
				<output className="py-8 text-center text-muted-foreground text-sm">
					No assets found
				</output>
			) : (
				<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
					{visible.map((asset) => {
						const Icon = icons[asset.kind];
						return (
							<Button
								key={asset.id}
								disabled={isDisabled}
								aria-pressed={selectedId === asset.id}
								onPress={() => onSelect(asset)}
								variant="outline"
								motion="flat"
								className="grid h-auto min-w-0 justify-stretch gap-2 whitespace-normal p-2 text-left normal-case"
							>
								<span className="relative grid aspect-video w-full place-items-center overflow-hidden bg-muted">
									{asset.kind === "image" || asset.thumbnail ? (
										<img
											src={asset.thumbnail ?? asset.url}
											alt=""
											className="h-full w-full object-cover"
										/>
									) : (
										<Icon className="size-8" />
									)}
									{selectedId === asset.id ? (
										<Check className="absolute right-1 bottom-1 size-5 bg-primary text-primary-foreground" />
									) : null}
								</span>
								<span className="truncate text-xs">{asset.name}</span>
								<span className="flex items-center gap-1 text-muted-foreground text-xs">
									<Icon size={12} />
									{asset.kind}
								</span>
							</Button>
						);
					})}
				</div>
			)}
			{selected ? (
				<div
					data-reader-component="AssetLibrary"
					data-reader-role="asset-preview"
					className="border-border border-t pt-4"
				>
					<h3 className="mb-2 font-bold text-sm">{selected.name}</h3>
					{selected.kind === "audio" ? (
						<audio
							controls
							src={selected.url}
							className="w-full"
							aria-label={selected.name}
						>
							<track kind="captions" />
						</audio>
					) : selected.kind === "video" ? (
						<video
							controls
							src={selected.url}
							poster={selected.thumbnail}
							className="max-h-80 w-full"
							aria-label={selected.name}
						>
							<track kind="captions" />
						</video>
					) : selected.kind === "image" ? (
						<img
							src={selected.url}
							alt={selected.name}
							className="max-h-72 max-w-full object-contain"
						/>
					) : (
						<a href={selected.url} download className="text-primary underline">
							Download {selected.name}
						</a>
					)}
				</div>
			) : null}
		</section>
	);
}
