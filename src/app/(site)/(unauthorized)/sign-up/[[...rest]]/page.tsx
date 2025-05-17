import { SignUp as ClerkSignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
	title: "Sign up | Talescape",
	description: "The community-driven hub of interactive tales",
};

function SignUp() {
	return <ClerkSignUp />;
}

export default SignUp;
