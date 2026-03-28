"use client";

import type { FragmentMeta } from "~/features/tale-reader/types/taleStructure";
import type {
  ImageFragmentData,
  TextFragmentData,
} from "~/server/db/types/tale-reader/fragment";

type TaleFragmentProps = {
  fragment: FragmentMeta;
};

export function TaleFragment({ fragment }: TaleFragmentProps) {
  // 📝 TEXT
  if (fragment.type === "text") {
    const data = fragment.data as TextFragmentData;

    return (
      <div className="w-full max-w-2xl px-6 sm:px-10">
        <p className="text-center text-base leading-7 sm:text-lg md:text-xl">
          {data.content}
        </p>
      </div>
    );
  }

  // 🖼️ IMAGE (🔥 mobile immersive)
  if (fragment.type === "image") {
    const data = fragment.data as ImageFragmentData;

    return (
      <div className="relative flex w-full items-center justify-center">
        <img
          src={data.url}
          alt={data.alt || "Tale fragment"}
          className="
            w-full 
            h-auto
            object-contain

            /* MOBILE — almost full screen */
            max-h-[90vh]

            /* remove padding feeling */
            px-0

            /* DESKTOP — more controlled */
            sm:max-h-[75vh] sm:max-w-4xl sm:px-6
            md:max-h-[70vh]
          "
        />
      </div>
    );
  }

  return null;
}

export default TaleFragment;