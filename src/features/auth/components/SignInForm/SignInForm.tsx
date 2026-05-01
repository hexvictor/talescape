import { SignIn } from "@clerk/nextjs";

export default function SignInForm() {
	return (
		<SignIn
			path="/sign-in"
			routing="path"
			fallbackRedirectUrl="/"
			signUpFallbackRedirectUrl="/"
		/>
	);
}
