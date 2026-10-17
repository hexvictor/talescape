"use client";

import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { PageShell } from "~/components/layout/page-shell";
import { Button } from "~/components/ui/button";
import { Panel } from "~/components/ui/panel";
import type { TaleAccessAction } from "../../../types";

type TaleUnauthorizedProps = {
	status: number;
	creatorUsername?: string;
	visibility?: string;
	title?: string;
	type?: string;
	creator?: string;
	action?: TaleAccessAction;
	returnTo?: string;
	slug?: string;
	taleId?: number;
};

const SIGN_IN_PATH = "/sign-in";

/**
 * Builds the internal route the user should return to after signing in.
 *
 * @param creatorUsername - Tale creator username or `official`.
 * @param slug - Tale slug.
 * @returns The internal return path.
 *
 * @example
 * buildReaderReturnToPath("alex", "my-tale") // "/alex/my-tale"
 */
function buildReaderReturnToPath(
	creatorUsername: string,
	slug: string,
): string {
	return `/${creatorUsername}/${slug}`;
}

/**
 * Builds the sign-in link with a safe return URL.
 *
 * @param returnTo - Internal path to restore after authentication.
 * @returns The sign-in URL with a query string.
 *
 * @example
 * buildSignInHref("/alex/my-tale") // "/sign-in?returnTo=%2Falex%2Fmy-tale"
 */
function buildSignInHref(returnTo: string): string {
	return `${SIGN_IN_PATH}?${new URLSearchParams({ returnTo }).toString()}`;
}

/**
 * Renders the unauthorized access screen for a tale.
 *
 * @param props.slug - Tale slug.
 * @param props.status - HTTP status code returned by the access check.
 * @param props.creatorUsername - Tale creator username.
 * @param props.visibility - Tale visibility label.
 * @param props.title - Tale title.
 * @param props.type - Tale type.
 * @param props.creator - Tale owner display name.
 * @param props.action - Access action, defaults to `read`.
 * @param props.returnTo - Explicit internal route restored after sign-in.
 * @param props.taleId - Tale id shown for Studio routes.
 * @returns The unauthorized tale screen.
 *
 * @example
 * <TaleUnauthorized slug="my-tale" status={401} creatorUsername="alex" />
 */
export default function TaleUnauthorized({
	action = "read",
	slug,
	status,
	creatorUsername,
	visibility,
	title,
	type,
	creator,
	returnTo,
	taleId,
}: TaleUnauthorizedProps): React.JSX.Element {
	const actionLabel = action === "edit" ? "edit" : "view";
	const resolvedReturnTo =
		returnTo ??
		(creatorUsername && slug
			? buildReaderReturnToPath(creatorUsername, slug)
			: "/");
	const signInHref = buildSignInHref(resolvedReturnTo);

	return (
		<PageShell
			fullscreen
			decorations="site-background"
			data-reader-component="TaleUnauthorized"
			data-reader-role="feedback-screen"
			className="ts-decoration-host fixed inset-0 isolate z-50 flex items-center justify-center bg-[var(--comic-teal)] p-5 text-foreground"
		>
			<Panel
				shapes="cut-opposite"
				className="w-full max-w-lg text-center"
				surfaceClassName="p-6 sm:p-9"
				data-reader-component="TaleUnauthorized"
				data-reader-role="feedback-panel"
			>
				<LockKeyhole
					size={38}
					strokeWidth={2.5}
					className="mx-auto mb-4 text-primary"
				/>
				<p className="mb-3 font-black text-[11px] text-[var(--comic-teal-dark)] uppercase">
					Protected tale
				</p>

				<h1 className="mb-3 font-display text-4xl uppercase leading-none">
					Sign in to {actionLabel} this tale
				</h1>

				{title ? (
					<div className="space-y-2">
						<p className="font-serif text-foreground text-lg italic">
							"{title}"
						</p>
						<p className="font-serif text-muted-foreground text-sm leading-6">
							{action === "edit"
								? "You need to sign in with an account that can edit this tale."
								: status === 403
									? "This tale is restricted. Sign in with an account that can access it."
									: "This tale requires a signed-in account to view."}
							{visibility ? (
								<>
									{" "}
									It is marked{" "}
									<strong className="text-foreground">{visibility}</strong>.
								</>
							) : null}
						</p>
					</div>
				) : (
					<p className="mb-1 font-serif text-muted-foreground text-sm leading-6">
						You must sign in to {actionLabel} this tale.
					</p>
				)}

				<Button asChild className="mt-6" variant="comic">
					<Link href={signInHref}>Sign in</Link>
				</Button>

				<p className="mt-4 text-muted-foreground text-xs">
					You will return to this tale after signing in.
				</p>

				<div className="mt-6 border-foreground border-t-2 pt-4 text-left font-mono text-[11px] text-muted-foreground uppercase">
					{taleId ? <p>Tale ID: {taleId}</p> : null}
					{slug ? <p>Slug: {slug}</p> : null}
					{creatorUsername ? <p>Creator Username: {creatorUsername}</p> : null}
					{creator && <p>Owner: {creator}</p>}
					{type && <p>Type: {type}</p>}
					<p>Status: {status}</p>
				</div>
			</Panel>
		</PageShell>
	);
}
