import * as motion from "motion/react-client";
import React from "react";

function StoryView() {
	return (
		<div>
			Story
			<motion.div
				initial={{ scale: 0 }}
				animate={{ scale: 1 }}
				className="bg-purple-500"
			>
				Story
			</motion.div>
		</div>
	);
}

export default StoryView;
