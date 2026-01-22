"use client";

import { useEffect, useRef } from "react";
import { useModal } from "./Modal";

type ModalBackdropProps = {
  children: React.ReactNode;
};

export default function ModalBackdrop({ children }: ModalBackdropProps) {
  const { hasBackdrop, blockInteraction, onDismiss, onKeyDown, dismissOnEsc } =
    useModal();
  const backdropRef = useRef<HTMLDivElement>(null);

  // Focus the backdrop when it mounts
  useEffect(() => {
    backdropRef.current?.focus();
  }, []);
  if (hasBackdrop || (!hasBackdrop && blockInteraction)) {
    return (
      <div
        className={`modal-backdrop ${
          blockInteraction ? "" : "pointer-events-none"
        } absolute inset-0 z-[1000] flex h-screen w-screen items-center justify-center ${
          hasBackdrop ? "bg-black/70" : ""
        }`}
        ref={backdropRef}
        onClick={hasBackdrop ? onDismiss : undefined}
        onKeyDown={hasBackdrop || dismissOnEsc ? onKeyDown : undefined}
        tabIndex={hasBackdrop || dismissOnEsc ? -1 : undefined}
        aria-label={hasBackdrop || dismissOnEsc ? "Close modal" : undefined}
      >
        {children}
      </div>
    );
  }
  return <>{children}</>;
}
