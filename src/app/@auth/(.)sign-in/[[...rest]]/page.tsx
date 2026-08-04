"use client";

import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import RouteDialog from "~/components/layout/RouteDialog";
import SignInForm from "~/features/auth/components/SignInForm";

/**
 * Sign-in modal route rendered in the auth slot.
 *
 * @returns The sign-in modal content.
 *
 * @example
 * <SignInModalPage />
 */
export default function SignInModalPage(): React.JSX.Element {
	const { isSignedIn } = useAuth();
	const searchParams = useSearchParams();
	const returnTo = searchParams.get("returnTo");
	const safeReturnTo =
		returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";

	return (
		<RouteDialog
			closeWhen={isSignedIn}
			contentClassName="w-auto overflow-hidden border-border/70 bg-card p-0 shadow-2xl sm:max-w-none"
			hideHeader
			replaceHrefs={["/sign-in", "/sign-up"]}
			fallbackHref={safeReturnTo}
			replaceOnClose
			title="Sign in"
		>
			<SignInForm returnTo={safeReturnTo} />
		</RouteDialog>
	);
}
