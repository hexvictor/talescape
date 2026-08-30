import type { Metadata } from "next";
import { CodexContent } from "../_shared/components/CodexContent";

export const metadata: Metadata = {
	title: "Codex | Talescape",
	description:
		"Explore characters, factions, art, and lore from Talescape worlds.",
};

export default function Codex() {
	return <CodexContent />;
}
