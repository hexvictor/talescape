"use client";
import React, { useState } from "react";
import EntryPage from "../ScrollSection";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";
import TaleSection from "../TaleSection";
import { motion } from "motion/react";

export function LoadingPage({ children }: { children: React.ReactNode }) {
  const [isMotionReady, setIsMotionReady] = useState(false);

  return (
    <>
      {!isMotionReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white">
          <p className="animate-pulse font-semibold text-xl">Loading...</p>
        </div>
      )}

      {/* This motion.div is invisible and used only to detect animation start */}
      <motion.div
        className="invisible h-0 w-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        onAnimationStart={() => setIsMotionReady(true)}
      />

      {isMotionReady && children}
    </>
  );
}

const TaleContentComponent = () => {
  const sections = useTaleReaderStore((s) => s.tale.sections);
  return (
    <LoadingPage>
      {sections.map((section) => (
        <TaleSection key={section.id} section={section} />
      ))}
    </LoadingPage>
  );
};

export default React.memo(TaleContentComponent);
