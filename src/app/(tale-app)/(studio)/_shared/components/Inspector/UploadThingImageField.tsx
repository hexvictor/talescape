"use client";
import { useRef } from "react";
import { FileUpload } from "~/components/media/file-upload";
import { useUploadThing } from "../../utils/uploadthing";
export function UploadThingImageField({
	label,
	onUploaded,
}: { label: string; onUploaded: (url: string) => void }): React.JSX.Element {
	const report = useRef<(percent: number) => void>(() => {});
	const { startUpload } = useUploadThing("imageUploader", {
		onUploadProgress: (percent) => report.current(percent),
	});
	return (
		<FileUpload
			label={label}
			onUploaded={onUploaded}
			upload={async (file, onProgress) => {
				report.current = onProgress;
				const result = await startUpload([file]);
				const url = result?.[0]?.ufsUrl ?? result?.[0]?.url;
				if (!url)
					throw new Error("Upload failed. Check your connection and sign-in.");
				return url;
			}}
		/>
	);
}
