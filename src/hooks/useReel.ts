import type React from "react";
import { useEffect, useState } from "react";
import type { CarouselApi } from "~/components/ui/Carousel";
import { useReaderStore } from "~/features/talereader/contexts/ReaderStoreContext";

type UseReelType = {
  setApi: React.Dispatch<React.SetStateAction<CarouselApi>>;
  next: () => void;
  prev: () => void;
};

export default function useReel(sectionId: number): UseReelType {
  const currentBlock = useReaderStore((s) => s.navigation?.block);
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;
    if (!currentBlock) return;
    if (sectionId === currentBlock.sectionId) api.scrollTo(currentBlock.index);
  }, [api, currentBlock, sectionId]);

  const next = () => api?.scrollNext();
  const prev = () => api?.scrollPrev();
  return {
    setApi,
    next,
    prev,
  };
}
