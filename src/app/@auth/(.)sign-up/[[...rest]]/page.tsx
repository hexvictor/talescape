"use client";

import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import SignUpForm from "~/app/_shared/auth/forms/SignUpForm";
import RouteDialog from "~/app/_shared/components/layout/RouteDialog";

export default function SignUpModalPage() {
	const { isSignedIn } = useAuth();
	const searchParams = useSearchParams();
	const returnTo = searchParams.get("returnTo");
	const safeReturnTo =
		returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";

	return (
		<RouteDialog
			closeWhen={isSignedIn}
			contentClassName="w-auto overflow-hidden rounded-none border-[3px] border-foreground bg-card p-0 shadow-[7px_7px_0_var(--comic-ink)] sm:max-w-none"
			hideHeader
			replaceHrefs={["/sign-in", "/sign-up"]}
			fallbackHref={safeReturnTo}
			replaceOnClose
			title="Sign up"
		>
			<SignUpForm />
		</RouteDialog>
	);
}
