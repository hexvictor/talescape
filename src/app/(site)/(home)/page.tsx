import { auth } from "@clerk/nextjs/server";
import {
	LandingPageContent,
	SignedInHomeContent,
} from "./_components/HomeContent";

export default async function Home() {
	const { userId } = await auth();

	return userId ? <SignedInHomeContent /> : <LandingPageContent />;
}
