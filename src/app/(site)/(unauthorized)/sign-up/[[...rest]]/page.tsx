import { SignUp as ClerkSignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Sign up | Talescape",
	description: "The community-driven hub of interactive tales",
};

function SignUp() {
	return (
		<ClerkSignUp
			path="/sign-up"
			routing="path"
			fallbackRedirectUrl="/"
			signInFallbackRedirectUrl="/"
		/>
	);
}

export default SignUp;
