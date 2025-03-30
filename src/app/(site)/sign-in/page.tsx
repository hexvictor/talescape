import { SignIn } from "@clerk/nextjs";
import React from "react";

function Login() {
	return <SignIn routing="hash" />;
}

export default Login;
