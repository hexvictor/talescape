import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
	title: "Sign up | Talescape",
	description: "The community-driven hub of interactive tales",
};

function Login() {
	return <SignUp routing="hash" />;
}

export default Login;
