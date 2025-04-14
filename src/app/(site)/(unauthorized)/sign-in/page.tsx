import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import React from "react";
import { UploadImage } from "~/app/_components/forms/UploadImage";

export const metadata: Metadata = {
	title: "Sign in | Talescape",
	description: "The community-driven hub of interactive tales",
};

function Login() {
	return (
		<>
			<SignIn routing="hash" />
		</>
	);
}

export default Login;
