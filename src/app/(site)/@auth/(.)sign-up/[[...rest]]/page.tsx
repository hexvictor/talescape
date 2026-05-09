"use client";

import { useAuth } from "@clerk/nextjs";
import RouteDialog from "~/components/layout/RouteDialog";
import SignUpForm from "~/features/auth/components/SignUpForm";

export default function SignUpModalPage() {
	const { isSignedIn } = useAuth();

	return (
		<RouteDialog
			closeWhen={isSignedIn}
			contentClassName="w-auto overflow-hidden border-border/70 bg-card p-0 shadow-2xl sm:max-w-none"
			hideHeader
			replaceHrefs={["/sign-in", "/sign-up"]}
			replaceOnClose
			title="Sign up"
		>
			<SignUpForm />
		</RouteDialog>
	);
}
