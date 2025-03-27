import React from "react";
import { IconPerson } from "../Icons";

function AvatarSkeleton() {
	return (
		<div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
			<IconPerson />
		</div>
	);
}

export default AvatarSkeleton;
