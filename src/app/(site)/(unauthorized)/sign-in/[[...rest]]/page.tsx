import { SignIn as ClerkSignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
	title: "Sign in | Talescape",
	description: "The community-driven hub of interactive tales",
};

function SignIn() {
	return (
		<>
			<ClerkSignIn />
		</>
	);
}

export default SignIn;
