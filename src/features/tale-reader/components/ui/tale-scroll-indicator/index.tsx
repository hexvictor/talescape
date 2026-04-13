import React from "react";
import { ChevronDownIcon } from "~/lib/utils/icons";

function TaleScrollIndicator() {
	return (
		<div className="-translate-x-1/2 absolute bottom-12 left-1/2 flex flex-col items-center">
			<span className="mb-2 text-muted-foreground text-sm uppercase tracking-widest">
				Scroll to Begin
			</span>
			<ChevronDownIcon className="h-6 w-6 animate-bounce text-muted-foreground" />
		</div>
	);
}

export default TaleScrollIndicator;
