import { ArrowRight, BookOpen, Plus, Settings2 } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { ComicPanel, ComicRail } from "~/components/layout/comic-panel";
import { Button } from "~/components/ui/button";
import Input from "~/components/ui/input";
import Textarea from "~/components/ui/textarea";
import { getTaleCreateOptions } from "~/server/db/data/library/queries";
import { createTaleAction } from "./actions";

type AddTalePageProps = {
	searchParams?: Promise<{
		error?: string;
	}>;
};

const fieldClass =
	"flex h-11 w-full border-2 border-input bg-card px-3 py-1 text-sm shadow-[3px_3px_0_rgb(var(--foreground-rgb))] outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/40";

export default async function AddTalePage({ searchParams }: AddTalePageProps) {
	const [{ canManageOfficial, userId, books }, params] = await Promise.all([
		getTaleCreateOptions(),
		searchParams,
	]);

	if (!userId) {
		return (
			<ComicPanel
				accent="primary"
				className="mx-auto w-full max-w-3xl p-7"
				decoration="strikes"
			>
				<ComicRail accent="primary">Create tale</ComicRail>
				<h1 className="mt-5 text-balance font-display text-5xl uppercase">
					Sign in to start a tale.
				</h1>
				<p className="mt-3 text-muted-foreground leading-7">
					Tales need an owner before their branches, scenes, and fragments can
					be saved.
				</p>
				<Button asChild className="mt-5">
					<Link href="/sign-in">Sign in</Link>
				</Button>
			</ComicPanel>
		);
	}

	return (
		<div className="mx-auto grid w-full max-w-7xl gap-5 py-2 lg:grid-cols-[1fr_24rem]">
			<form action={createTaleAction} className="grid gap-5">
				<ComicPanel
					accent="primary"
					className="p-6 sm:p-8"
					decoration="strikes"
				>
					<div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
						<div>
							<p className="font-semibold text-primary text-sm uppercase tracking-normal">
								Create Tale
							</p>
							<h1 className="mt-2 text-balance font-bold text-3xl">
								Start a tale draft.
							</h1>
							<p className="mt-2 max-w-2xl text-muted-foreground text-sm leading-6">
								The editor creates a starter root branch, one part, one entry,
								one page, one block, one root node, and one centered title
								fragment.
							</p>
						</div>
						<Button type="submit">
							<Plus aria-hidden="true" />
							Create Tale
						</Button>
					</div>
					{params?.error === "missing-user" ? (
						<p className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-destructive text-sm">
							Your signed-in Clerk user is not seeded in Talescape yet.
						</p>
					) : null}
				</ComicPanel>

				<ComicPanel
					accent="secondary"
					className="grid gap-4 p-6 sm:p-8"
					shape="corner-top-right"
				>
					<SectionTitle
						icon={<BookOpen aria-hidden="true" className="size-4" />}
						label="Tale"
						title="Identity"
					/>
					<div className="grid gap-4 md:grid-cols-2">
						<Field label="Title" htmlFor="title">
							<Input
								id="title"
								name="title"
								required
								defaultValue="New Talescape Draft"
							/>
						</Field>
						<Field label="Slug" htmlFor="slug">
							<Input id="slug" name="slug" placeholder="new-talescape-draft" />
						</Field>
						<Field label="Book" htmlFor="bookId">
							<select id="bookId" name="bookId" className={fieldClass}>
								<option value="none">No book</option>
								{books.map((book) => (
									<option key={book.id} value={book.id}>
										{book.title}
										{book.author?.fullName ? ` - ${book.author.fullName}` : ""}
									</option>
								))}
							</select>
						</Field>
						<Field label="Type" htmlFor="type">
							<select id="type" name="type" className={fieldClass}>
								<option value="story">Story</option>
								<option value="codex">Codex</option>
								<option value="timeline">Timeline</option>
							</select>
						</Field>
						<Field label="Visibility" htmlFor="visibility">
							<select id="visibility" name="visibility" className={fieldClass}>
								<option value="private">Private</option>
								<option value="restricted">Restricted</option>
								<option value="public">Public</option>
							</select>
						</Field>
						<Field label="Status" htmlFor="status">
							<select id="status" name="status" className={fieldClass}>
								<option value="draft">Draft</option>
								<option value="review">Review</option>
								<option value="approved">Approved</option>
								<option value="rejected">Rejected</option>
								<option value="published">Published</option>
								<option value="archived">Archived</option>
							</select>
						</Field>
						<Field label="Cloneable" htmlFor="cloneable">
							<select id="cloneable" name="cloneable" className={fieldClass}>
								<option value="private">Private</option>
								<option value="shared">Shared</option>
								<option value="public">Public</option>
							</select>
						</Field>
						<Field label="Editable" htmlFor="editable">
							<select id="editable" name="editable" className={fieldClass}>
								<option value="true">Editable</option>
								<option value="false">Locked</option>
							</select>
						</Field>
						{canManageOfficial ? (
							<>
								<Field label="Official" htmlFor="isOfficial">
									<select
										id="isOfficial"
										name="isOfficial"
										className={fieldClass}
									>
										<option value="false">Creator tale</option>
										<option value="true">Official tale</option>
									</select>
								</Field>
								<Field label="Verified" htmlFor="isVerified">
									<select
										id="isVerified"
										name="isVerified"
										className={fieldClass}
									>
										<option value="false">Not verified</option>
										<option value="true">Verified</option>
									</select>
								</Field>
							</>
						) : null}
					</div>
					<Field label="Description" htmlFor="description">
						<Textarea
							id="description"
							name="description"
							required
							defaultValue="A newly drafted interactive tale."
							className="min-h-24"
						/>
					</Field>
				</ComicPanel>
			</form>

			<aside className="grid gap-5 self-start lg:sticky lg:top-20">
				<StructurePreview />
				<ComicPanel accent="accent" className="p-5" shape="corner-bottom-left">
					<h2 className="font-semibold text-lg">After save</h2>
					<div className="mt-4 grid gap-3 text-sm">
						<PreviewKeyframe
							icon={<Settings2 className="size-4" />}
							text="A minimal editable reader structure is created automatically."
						/>
						<PreviewKeyframe
							icon={<BookOpen className="size-4" />}
							text="The starter block shows the tale title in the center."
						/>
						<PreviewKeyframe
							icon={<ArrowRight className="size-4" />}
							text="Branching mode creates the first path."
						/>
					</div>
				</ComicPanel>
			</aside>
		</div>
	);
}

function SectionTitle({
	icon,
	label,
	title,
}: {
	icon: ReactNode;
	label: string;
	title: string;
}) {
	return (
		<div>
			<p className="flex items-center gap-2 font-semibold text-primary text-sm uppercase tracking-normal">
				{icon}
				{label}
			</p>
			<h2 className="mt-2 font-semibold text-2xl">{title}</h2>
		</div>
	);
}

function Field({
	label,
	htmlFor,
	children,
}: {
	label: string;
	htmlFor: string;
	children: ReactNode;
}) {
	return (
		<div className="grid gap-2">
			<label htmlFor={htmlFor} className="font-medium text-sm">
				{label}
			</label>
			{children}
		</div>
	);
}

function StructurePreview() {
	return (
		<ComicPanel accent="secondary" className="p-5" shape="corners-right">
			<h2 className="font-semibold text-lg">Structure preview</h2>
			<div className="mt-4 grid gap-4">
				<div className="border-secondary border-l-4 bg-muted p-4">
					<p className="font-semibold text-sm">Reader path</p>
					<div className="mt-3 grid gap-2 text-sm">
						<PreviewKeyframe text="Branch" />
						<PreviewKeyframe text="Section" />
						<PreviewKeyframe text="Scenes" />
						<PreviewKeyframe text="Elements" />
					</div>
				</div>
				<div className="border-primary border-l-4 bg-muted p-4">
					<p className="font-semibold text-sm">Narrative spine</p>
					<div className="mt-3 grid gap-2 text-sm">
						<PreviewKeyframe text="Part" />
						<PreviewKeyframe text="Entry" />
						<PreviewKeyframe text="Pages" />
						<PreviewKeyframe text="Scene links" />
					</div>
				</div>
			</div>
		</ComicPanel>
	);
}

function PreviewKeyframe({
	icon,
	text,
}: {
	icon?: ReactNode;
	text: string;
}) {
	return (
		<div className="flex items-center gap-2 border border-foreground/20 bg-background px-3 py-2">
			<span className="flex size-6 items-center justify-center bg-secondary text-secondary-foreground">
				{icon ?? <ArrowRight aria-hidden="true" className="size-3.5" />}
			</span>
			<span>{text}</span>
		</div>
	);
}
