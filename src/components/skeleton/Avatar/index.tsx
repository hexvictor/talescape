import React from "react";
import { UserIcon } from "~/lib/utils/icons";

function SkeletonAvatar() {
  return (
    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black">
      <UserIcon />
    </div>
  );
}

export default SkeletonAvatar;
