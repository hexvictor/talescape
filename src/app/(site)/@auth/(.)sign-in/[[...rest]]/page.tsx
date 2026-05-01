"use client";

import { useAuth } from "@clerk/nextjs";
import RouteDialog from "~/components/layout/RouteDialog";
import SignInForm from "~/features/auth/components/SignInForm";

export default function SignInModalPage() {
	const { isSignedIn } = useAuth();

	return (
		<RouteDialog
			closeWhen={isSignedIn}
			contentClassName="w-auto overflow-hidden border-border/70 bg-card p-0 shadow-2xl sm:max-w-none"
			hideHeader
			replaceHrefs={["/sign-in", "/sign-up"]}
			replaceOnClose
			title="Sign in"
		>
			<SignInForm />
		</RouteDialog>
	);
}
