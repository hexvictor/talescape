import type { Metadata } from "next";
import SignUpForm from "~/app/_shared/auth/forms/SignUpForm";

export const metadata: Metadata = {
	title: "Sign up | Talescape",
	description: "The community-driven hub of interactive tales",
};

function SignUp() {
	return <SignUpForm />;
}

export default SignUp;
