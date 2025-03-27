"use client";
import { UploadButton } from "@/utils/uploadThing";
import { useRouter } from "next/navigation";
import React from "react";

function UploadImage() {
	const router = useRouter();
	return (
		<UploadButton
			endpoint="imageUploader"
			onClientUploadComplete={(res) => {
				// Do something with the response
				// console.log("Files: ", res);
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
