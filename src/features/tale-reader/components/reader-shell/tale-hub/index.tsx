"use client";

import { Button } from "~/components/ui/button";
import {
	Drawer,
	DrawerContent,
	DrawerHeader,
	DrawerTitle,
} from "~/components/ui/drawer";
import { useReaderStore } from "~/features/tale-reader/contexts/ReaderStoreContext";

export default function TaleHub() {
	const taleHubOpen = useReaderStore((s) => s.taleHubOpen);
	const openTaleHub = useReaderStore((s) => s.openTaleHub);
	const closeTaleHub = useReaderStore((s) => s.closeTaleHub);

	return (
		<Drawer
			open={taleHubOpen}
			onOpenChange={(open) => {
				if (open) openTaleHub();
				else closeTaleHub();
			}}
			direction="right"
			dismissible={false}
		>
			<DrawerContent className="m-0 h-[100svh] w-screen rounded-none border-0 bg-neutral-950 p-0">
				<div className="relative h-[100svh] w-screen bg-neutral-950 text-white">
					<div className="fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-neutral-950/90 px-4 backdrop-blur">
						<div className="flex items-center justify-between py-3 pt-[calc(env(safe-area-inset-top)+12px)]">
							<DrawerHeader className="p-0">
								<DrawerTitle className="font-semibold text-base">
									Tale Hub
								</DrawerTitle>
							</DrawerHeader>

							<Button
								type="button"
								variant="secondary"
								onClick={closeTaleHub}
								className="select-none"
							>
								← Return
							</Button>
						</div>
					</div>

					<div className="h-[100svh] overflow-y-auto pb-[env(safe-area-inset-bottom)] pt-[calc(env(safe-area-inset-top)+64px)]">
						<section className="flex min-h-[100svh] items-center justify-center px-6">
							<div className="mx-auto w-full max-w-3xl space-y-4">
								<h3 className="font-bold text-3xl">Tale Hub</h3>
								<p className="text-white/80 leading-relaxed">
									Community gallery, extra information, notes, meta content, and
									more can live here.
								</p>
							</div>
						</section>
					</div>
				</div>
			</DrawerContent>
		</Drawer>
	);
}
