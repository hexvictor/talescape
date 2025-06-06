"use client";
import React from "react";
import { useSearchParams } from "next/navigation";
import type { TaleSection as TaleSectionType } from "~/lib/data";
import ReelSection from "../ReelSection";
import ScrollSection from "../ScrollSection";

type TaleSectionProps = {
  section: TaleSectionType;
};

function TaleSection({ section }: TaleSectionProps) {
  //   const layout = useTaleReaderStore((s) => s.tale.layout);
  const searchParams = useSearchParams();
  const layout = searchParams.get("layout") ?? "scroll"; // fallback padrão

  if (layout === "reel") {
    return <ReelSection section={section} />;
  }
  return <ScrollSection section={section} />;
}

export default TaleSection;
