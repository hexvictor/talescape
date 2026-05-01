import type { Metadata } from "next";
import SignInForm from "~/features/auth/components/SignInForm";

export const metadata: Metadata = {
	title: "Sign in | Talescape",
	description: "The community-driven hub of interactive tales",
};

function SignIn() {
	return <SignInForm />;
}

export default SignIn;
