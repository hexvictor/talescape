import { SignIn as ClerkSignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Sign in | Talescape",
	description: "The community-driven hub of interactive tales",
};

function SignIn() {
	return (
		<>
			<ClerkSignIn
				path="/sign-in"
				routing="path"
				fallbackRedirectUrl="/"
				signUpFallbackRedirectUrl="/"
			/>
		</>
	);
}

export default SignIn;
