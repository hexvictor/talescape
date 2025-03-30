import { SignUp } from "@clerk/nextjs";
import React from "react";

function Login() {
	return <SignUp routing="hash" />;
}

export default Login;
