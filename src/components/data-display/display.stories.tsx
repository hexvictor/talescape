import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ImageIcon, Plus } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge, StatusBadge, Tag } from "./badge";
import { EmptyState } from "./empty-state";
import { Skeleton } from "./skeleton";
import { Thumbnail } from "./thumbnail";

function DisplayShowcase(): React.JSX.Element {
	return (
		<div className="grid max-w-2xl gap-6">
			<div className="flex flex-wrap items-center gap-2">
				<Badge>Official</Badge>
				<StatusBadge status="published" />
				<StatusBadge status="review" />
				<StatusBadge status="rejected" />
				<Tag>Fantasy</Tag>
				<Tag>Branching narrative</Tag>
			</div>
			<div className="flex flex-wrap gap-3">
				<Thumbnail
					className="aspect-video w-40"
					src="/reader-demo/thornwick-market.svg"
					alt="Thornwick market"
				/>
				<Thumbnail
					className="aspect-video w-40"
					fit="contain"
					src="/assets/brand/talescape-logo-mark.png"
					alt="Talescape"
				/>
				<Thumbnail className="aspect-video w-40" />
			</div>
			<EmptyState
				title="No scenes found"
				description="Create a Scene to begin arranging Frames and Elements."
				icon={<ImageIcon className="size-5" />}
				actions={
					<Button size="sm">
						<Plus /> Add scene
					</Button>
				}
			/>
			<div className="grid gap-3 sm:grid-cols-3">
				<Skeleton className="aspect-video" />
				<div className="grid content-start gap-2 sm:col-span-2">
					<Skeleton className="h-5 w-2/3" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-4/5" />
				</div>
			</div>
		</div>
	);
}

const meta = {
	component: DisplayShowcase,
	parameters: {
		docs: {
			description: {
				component:
					"Display primitives centralize image sizing and failure fallback, actionable empty states, and reduced-motion-safe loading placeholders.",
			},
		},
	},
	tags: ["autodocs"],
	title: "Design System/Display/States and Thumbnails",
} satisfies Meta<typeof DisplayShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ThumbnailStates: Story = {
	render: () => (
		<div className="flex flex-wrap gap-3">
			<Thumbnail
				className="h-16 w-24"
				src="/reader-demo/thornwick-woods.svg"
				alt="Thornwick woods"
			/>
			<Thumbnail className="h-16 w-24" selected />
			<Thumbnail className="h-16 w-24" disabled />
			<Thumbnail className="h-16 w-24" src="/missing-thumbnail.png" />
		</div>
	),
};

export const CompactElementPreview: Story = {
	render: () => (
		<div className="flex items-center gap-3 text-xs">
			<Thumbnail
				className="h-11 w-14"
				src="/reader-demo/thornwick-church.svg"
				alt=""
			/>
			<div>
				<p className="font-bold">Church backdrop</p>
				<p className="text-muted-foreground">Image element</p>
			</div>
		</div>
	),
};
