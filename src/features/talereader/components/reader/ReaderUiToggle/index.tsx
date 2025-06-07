"use client";

import clsx from "clsx";
import { Eye, EyeIcon, EyeOff, EyeOffIcon } from "lucide-react";
import { Button } from "~/components/ui/Button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/Tooltip";
import { useTaleReaderStore } from "~/lib/stores/TaleReaderStore";

export default function ReaderUiToggle() {
  const { uiVisible, toggleUI } = useTaleReaderStore();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={uiVisible ? "outline" : "ghost"}
          size="icon"
          className={clsx(
            "pointer-events-auto absolute bottom-6 left-6 z-50 cursor-pointer rounded-full shadow-lg hover:scale-105"
          )}
          onClick={() => toggleUI()}
          aria-label={uiVisible ? "Hide interface" : "Show interface"}
        >
          {uiVisible ? (
            <EyeOff className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {uiVisible ? "Hide interface" : "Show interface"}
      </TooltipContent>
    </Tooltip>
  );
}
