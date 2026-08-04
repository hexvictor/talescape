"use client";

import type React from "react";

function TaleNotFound(): React.JSX.Element {
	return (
		<div
			data-reader-component="TaleNotFound"
			data-reader-role="feedback-screen"
			className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-6 text-center text-foreground"
		>
			<h1 className="mb-4 font-bold text-2xl">Tale Not Found</h1>
			<p className="mb-2 text-gray-400">
				The tale you're looking for doesn't exist or is no longer available.
			</p>
		</div>
	);
}

export default TaleNotFound;
