"use client";

import Link from "next/link";
import type { TaleStoreMode } from "../../../types";

type TaleUnauthorizedProps = {
	slug: string;
	status: number;
	creatorUsername: string;
	visibility?: string;
	title?: string;
	type?: string;
	creator?: string;
	mode?: TaleStoreMode;
};

const SIGN_IN_PATH = "/sign-in";

/**
 * Builds the internal route the user should return to after signing in.
 *
 * @param creatorUsername - Tale creator username or `official`.
 * @param slug - Tale slug.
 * @param mode - Reader mode, `read` or `edit`.
 * @returns The internal return path.
 *
 * @example
 * buildReturnToPath("alex", "my-tale", "edit") // "/alex/my-tale/edit"
 */
function buildReturnToPath(
	creatorUsername: string,
	slug: string,
	mode: TaleStoreMode,
): string {
	return mode === "edit"
		? `/${creatorUsername}/${slug}/edit`
		: `/${creatorUsername}/${slug}`;
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
 * @param props.mode - Reader mode, defaults to `read`.
 * @returns The unauthorized tale screen.
 *
 * @example
 * <TaleUnauthorized slug="my-tale" status={401} creatorUsername="alex" />
 */
export default function TaleUnauthorized({
	slug,
	status,
	creatorUsername,
	visibility,
	title,
	type,
	creator,
	mode = "read",
}: TaleUnauthorizedProps): React.JSX.Element {
	const action = mode === "edit" ? "edit" : "view";
	const returnTo = buildReturnToPath(creatorUsername, slug, mode);
	const signInHref = buildSignInHref(returnTo);

	return (
		<div
			data-reader-component="TaleUnauthorized"
			data-reader-role="feedback-screen"
			className="fixed inset-0 z-50 flex items-center justify-center bg-background p-6 text-foreground"
		>
			<div className="w-full max-w-md rounded-2xl border border-foreground/10 bg-foreground/5 p-6 text-center shadow-2xl backdrop-blur-sm">
				<p className="mb-3 text-foreground/45 text-xs uppercase tracking-[0.24em]">
					Protected tale
				</p>

				<h1 className="mb-3 font-semibold text-2xl tracking-tight">
					Sign in to {action} this tale
				</h1>

				{title ? (
					<div className="space-y-2">
						<p className="text-foreground/90 text-lg italic">"{title}"</p>
						<p className="text-foreground/65 text-sm leading-6">
							{mode === "edit"
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
					<p className="mb-1 text-foreground/65 text-sm leading-6">
						You must sign in to {action} this tale.
					</p>
				)}

				<Link
					href={signInHref}
					className="mt-6 inline-flex items-center justify-center rounded-lg bg-foreground px-4 py-2.5 font-medium text-background transition-colors hover:bg-foreground/90"
				>
					Sign in
				</Link>

				<p className="mt-3 text-foreground/40 text-xs">
					You will return to this tale after signing in.
				</p>

				<div className="mt-6 border-foreground/10 border-t pt-4 text-left text-foreground/35 text-xs">
					<p>Slug: {slug}</p>
					<p>Creator Username: {creatorUsername}</p>
					{creator && <p>Owner: {creator}</p>}
					{type && <p>Type: {type}</p>}
					<p>Status: {status}</p>
				</div>
			</div>
		</div>
	);
}
