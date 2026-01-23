"use client";

import { XIcon } from "~/lib/utils/icons";
import { useModal } from "./modal";

type ModalWrapperProps = {
  children: React.ReactNode;
};

export default function ModalWrapper({ children }: ModalWrapperProps) {
  const {
    hasBackdrop,
    fitContent,
    showCloseButton,
    rounded,
    onDismiss,
    onKeyDown,
  } = useModal();
  const isCentered = hasBackdrop;
  return (
    <div
      className={`modal pointer-events-auto ${
        isCentered
          ? "relative"
          : "-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2"
      } flex h-auto ${
        fitContent ? "" : "max-h-[500px] w-[80%] max-w-[500px]"
      } items-center justify-center ${
        rounded ? "rounded-[12px]" : ""
      } border-none bg-transparent font-medium text-2xl`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {children}
      {showCloseButton && (
        <button
          type="button"
          aria-label="Close modal"
          onClick={onDismiss}
          onKeyDown={onKeyDown}
          className="close-button absolute top-[10px] right-[10px] flex h-5 w-5 cursor-pointer items-center justify-center rounded-[20px] border-none bg-transparent font-medium text-[14px] text-white hover:bg-gray-100/70 hover:text-black"
        >
          <XIcon />
        </button>
      )}
    </div>
  );
}
