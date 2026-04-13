"use client";
import { UploadButton } from "~/lib/utils/uploadThing";
import { useRouter } from "next/navigation";
import React from "react";

function UploadImage() {
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

export default UploadImage;
