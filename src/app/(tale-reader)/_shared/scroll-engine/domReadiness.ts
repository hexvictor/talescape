"use client";

export async function waitForImagesIn(root: HTMLElement | null) {
	if (!root) {
		return { imageCount: 0 };
	}

	const images = Array.from(root.querySelectorAll<HTMLImageElement>("img"));

	if (!images.length) {
		return { imageCount: 0 };
	}

	await Promise.all(
		images.map(
			(img) =>
				new Promise<void>((resolve) => {
					if (img.complete) {
						resolve();
						return;
					}

					const handleDone = () => {
						img.removeEventListener("load", handleDone);
						img.removeEventListener("error", handleDone);
						resolve();
					};

					img.addEventListener("load", handleDone, { once: true });
					img.addEventListener("error", handleDone, { once: true });
				}),
		),
	);

	return { imageCount: images.length };
}
