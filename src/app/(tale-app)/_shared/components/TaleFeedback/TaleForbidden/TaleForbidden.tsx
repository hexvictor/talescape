"use client";

import { Home, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { PageShell } from "~/components/layout/page-shell";
import { Button } from "~/components/ui/button";
import { Panel } from "~/components/ui/panel";

type TaleForbiddenProps = {
	action?: "edit" | "view";
	slug?: string;
	creatorUsername?: string;
	visibility?: string;
	title?: string;
	type?: string;
	creator?: string;
	taleId?: number;
};

export default function TaleForbidden({
	action = "view",
	slug,
	creatorUsername,
	visibility,
	title,
	type,
	creator,
	taleId,
}: TaleForbiddenProps): React.JSX.Element {
	return (
		<PageShell
			fullscreen
			decorations="site-background"
			data-reader-component="TaleForbidden"
			data-reader-role="feedback-screen"
			className="ts-decoration-host fixed inset-0 isolate z-50 flex items-center justify-center bg-[var(--comic-red)] p-5 text-center text-foreground"
		>
			<Panel
				shapes="cut-opposite"
				className="w-full max-w-lg text-center"
				surfaceClassName="p-6 sm:p-9"
				data-reader-component="TaleForbidden"
				data-reader-role="feedback-panel"
			>
				<ShieldAlert
					size={42}
					strokeWidth={2.5}
					className="mx-auto mb-4 text-primary"
				/>
				<p className="mb-3 font-black text-[11px] text-primary uppercase">
					Restricted tale
				</p>
				<h1 className="mb-3 font-display text-4xl uppercase leading-none">
					{action === "edit" ? "Editing unavailable" : "Access forbidden"}
				</h1>

				{title ? (
					<>
						<p className="mb-1 font-serif text-lg italic">"{title}"</p>
						<p className="mb-4 font-serif text-muted-foreground text-sm leading-6">
							This tale is <strong>{visibility}</strong> and you do not have
							permission to {action} it.
						</p>
					</>
				) : (
					<p className="mb-4 font-serif text-muted-foreground text-sm leading-6">
						You do not have permission to {action} this tale.
					</p>
				)}

				<Button asChild className="mt-4" variant="comic">
					<Link href="/">
						<Home size={17} /> Go to homepage
					</Link>
				</Button>

				<div className="mt-6 border-foreground border-t-2 pt-4 font-mono text-[11px] text-muted-foreground uppercase">
					{taleId ? <p>Tale ID: {taleId}</p> : null}
					{slug ? <p>Slug: {slug}</p> : null}
					{creatorUsername ? <p>Creator ID: {creatorUsername}</p> : null}
					{creator && <p>Owner: {creator}</p>}
					{type && <p>Type: {type}</p>}
				</div>
			</Panel>
		</PageShell>
	);
}
