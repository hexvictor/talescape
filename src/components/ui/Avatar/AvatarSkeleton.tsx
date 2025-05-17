import React from "react";
import { UserIcon } from "~/utils/icons";

function AvatarSkeleton() {
	return (
		<div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
			<UserIcon />
		</div>
	);
}

export default AvatarSkeleton;
