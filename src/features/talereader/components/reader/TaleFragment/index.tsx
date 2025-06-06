import React from "react";
import type { TaleFragment as TaleFragmentType } from "~/lib/data";
import { LoremIpsum } from "lorem-ipsum";

const lorem = new LoremIpsum();
function TaleFragment({ id, type, content }: TaleFragmentType) {
  if (type === "text") {
    return (
      <p key={id} className="text-base leading-relaxed">
        {content}
      </p>
    );
  }

  if (type === "image") {
    return (
      <img key={id} src={content} alt="Tale fragment" className="rounded-md" />
    );
  }

  return null;
}

export default TaleFragment;
