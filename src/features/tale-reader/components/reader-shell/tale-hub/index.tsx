"use client";

import { useMemo } from "react";
import { LoremIpsum } from "lorem-ipsum";

import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";

import { useReaderNavContext } from "~/features/tale-reader/contexts/ReaderNavContext";

const lorem = new LoremIpsum({
  sentencesPerParagraph: { max: 6, min: 3 },
  wordsPerSentence: { max: 12, min: 5 },
});

export default function TaleHub() {
  const { taleHubOpen, closeTaleHub, openTaleHub } = useReaderNavContext();
  const detailText = useMemo(() => lorem.generateParagraphs(6), []);

  const onOpenChange = (open: boolean) => {
    if (open) openTaleHub();
    else closeTaleHub();
  };

  return (
    <Drawer
      open={taleHubOpen}
      onOpenChange={onOpenChange}
      direction="right"
      dismissible={false}
    >
      <DrawerContent className="m-0 h-[100svh] w-screen rounded-none border-0 bg-neutral-950 p-0">
        <div className="relative h-[100svh] w-screen bg-neutral-950 text-white">
          <div className="fixed top-0 right-0 left-0 z-[999] border-white/10 border-b bg-neutral-950/90 px-4 backdrop-blur">
            <div className="flex items-center justify-between py-3 pt-[calc(env(safe-area-inset-top)+12px)]">
              <DrawerHeader className="p-0">
                <DrawerTitle className="font-semibold text-base">
                  Tale Hub
                </DrawerTitle>
              </DrawerHeader>

              <Button
                type="button"
                variant="secondary"
                onClick={closeTaleHub}
                className="select-none"
              >
                ← Return
              </Button>
            </div>
          </div>

          <div className="h-[100svh] overflow-y-auto pb-[env(safe-area-inset-bottom)] pt-[calc(env(safe-area-inset-top)+64px)]">
            <section className="flex min-h-[100svh] items-center justify-center px-6">
              <div className="mx-auto w-full max-w-3xl space-y-4">
                <h3 className="font-bold text-3xl">Tale Hub</h3>
                <p className="text-white/80 leading-relaxed">{detailText}</p>
                <p className="text-white/80 leading-relaxed">
                  Community gallery, extra information, author notes, etc.
                </p>
              </div>
            </section>

            <section className="flex min-h-[100svh] items-center justify-center bg-white/5 px-6">
              <div className="mx-auto w-full max-w-3xl space-y-4">
                <h4 className="font-semibold text-2xl">More sections</h4>
                <p className="text-white/80 leading-relaxed">
                  This hub is independent from the main GSAP scroller.
                </p>
              </div>
            </section>

            <section className="flex min-h-[100svh] items-center justify-center px-6">
              <div className="mx-auto w-full max-w-3xl space-y-4">
                <h4 className="font-semibold text-2xl">End</h4>
                <p className="text-white/80 leading-relaxed">
                  Close with the Return button (top-right).
                </p>
              </div>
            </section>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
