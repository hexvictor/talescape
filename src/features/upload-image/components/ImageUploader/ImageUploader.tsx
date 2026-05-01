"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { UploadButton } from "~/lib/utils/uploadThing";

function ImageUploader() {
	const router = useRouter();
	return (
		<UploadButton
			endpoint="imageUploader"
			onClientUploadComplete={(res) => {
				console.log("files:", res);
				// Do something with the response
				router.refresh();
			}}
			onUploadError={(error: Error) => {
				// Do something with the error.
				alert(`ERROR! ${error.message}`);
			}}
		/>
	);
}

export default ImageUploader;
