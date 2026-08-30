import { SignIn } from "@clerk/nextjs";

type SignInFormProps = {
	returnTo?: string;
};

/**
 * Clerk sign-in widget wrapper.
 *
 * @param props.returnTo - Internal route to redirect to after sign-in.
 * @returns The Clerk sign-in widget.
 */
export default function SignInForm({
	returnTo = "/",
}: SignInFormProps): React.JSX.Element {
	return (
		<SignIn
			path="/sign-in"
			routing="path"
			fallbackRedirectUrl={returnTo}
			signUpFallbackRedirectUrl={returnTo}
		/>
	);
}
