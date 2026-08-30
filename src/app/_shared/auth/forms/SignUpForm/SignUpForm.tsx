import { SignUp } from "@clerk/nextjs";

export default function SignUpForm() {
	return (
		<SignUp
			path="/sign-up"
			routing="path"
			fallbackRedirectUrl="/"
			signInFallbackRedirectUrl="/"
		/>
	);
}
