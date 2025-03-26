"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RouteModal } from "@/app/_components/ui/RouteModal";
import { LoginForm } from "@/app/_components/forms/LoginForm";

export default function LoginModalPage() {
	const router = useRouter();
	// const { user, loading } = useSession();
	const user = false;
	const loading = false;

	useEffect(() => {
		if (!loading && user) {
			router.replace("/"); // redirect if logged in
		}
	}, [router]);

	if (loading || user) return null;

	return (
		<RouteModal>
			<LoginForm />
		</RouteModal>
	);
}
