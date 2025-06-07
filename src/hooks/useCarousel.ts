import type React from "react";
import { useEffect, useState } from "react";
import type { CarouselApi } from "~/components/ui/Carousel";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";

type UseCarouselType = {
  setApi: React.Dispatch<React.SetStateAction<CarouselApi>>;
  showPrev: boolean;
  showNext: boolean;
  next: () => void;
  prev: () => void;
};

export default function useCarousel(): UseCarouselType {
  const currentBlockIndex = useTaleReaderStore((s) => s.currentBlockIndex);
  const [api, setApi] = useState<CarouselApi>();

  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setIndex(api.selectedScrollSnap());
    api.on("select", () => {
      setIndex(api.selectedScrollSnap());
    });
  }, [api]);

  useEffect(() => {
    if (!api) return;
    api.scrollTo(currentBlockIndex);
  }, [api, currentBlockIndex]);

  const showPrev = index > 0;
  const showNext = index < count - 1;

  const next = () => api?.scrollNext();
  const prev = () => api?.scrollPrev();
  return {
    setApi,
    showPrev,
    showNext,
    next,
    prev,
  };
}
