import React from "react";
import { PersonIcon } from "~/utils/icons";

function AvatarSkeleton() {
	return (
		<div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
			<PersonIcon />
		</div>
	);
}

export default AvatarSkeleton;
