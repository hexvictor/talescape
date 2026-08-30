import React from "react";

const SkeletonAuthStatus = () => {
	return (
		<div className="flex animate-pulse items-center gap-2 rounded-sm border border-white/20 bg-transparent px-4 py-2 font-semibold text-white">
			<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
			<span className="text-white/50">Sign in</span>
		</div>
	);
};

export default SkeletonAuthStatus;
