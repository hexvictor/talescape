import type { Metadata } from "next";
import SignInForm from "~/features/auth/components/SignInForm";

export const metadata: Metadata = {
	title: "Sign in | Talescape",
	description: "The community-driven hub of interactive tales",
};

type SignInPageProps = {
	searchParams?: Promise<{
		returnTo?: string;
	}>;
};

/**
 * Sign-in page route.
 *
 * @param props.searchParams - Promise of query string parameters from the URL.
 * @returns The full-page sign-in view.
 *
 * @example
 * <SignIn searchParams={Promise.resolve({ returnTo: "/creator/tale-slug" })} />
 */
async function SignIn({
	searchParams,
}: SignInPageProps): Promise<React.JSX.Element> {
	const params = await searchParams;
	const returnTo = params?.returnTo;

	const safeReturnTo =
		returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";

	return <SignInForm returnTo={safeReturnTo} />;
}

export default SignIn;
