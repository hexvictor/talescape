"use client";
import React from "react";
import type { BlockMeta } from "~/features/tale-reader/types/taleStructure";
import { useReaderStore } from "../../contexts/ReaderStoreContext";

type Props = {
  block: BlockMeta;
};

function Field({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 px-2.5 py-2">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-white/55">
        {label}
      </p>
      <p className="break-all text-[11px] leading-tight text-white sm:text-xs">
        {value ?? "—"}
      </p>
    </div>
  );
}

function SectionCard({
  title,
  tone,
  children,
}: {
  title: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-2xl border p-3 shadow-lg ${tone}`}>
      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide sm:text-sm">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-2">{children}</div>
    </div>
  );
}

function TaleBlockDebugPanelComponent({ block }: Props) {
  const debugMode = useReaderStore((s) => s.debugMode);
  const [open, setOpen] = React.useState(false);

  if (!debugMode) return null;

  return (
    <div className="pointer-events-none absolute top-24 right-2 z-[60] flex max-w-[min(96vw,72rem)] flex-col items-end gap-2 sm:top-24 sm:right-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="pointer-events-auto inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-white/20 bg-black/75 px-3 text-[11px] font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-black/85 sm:h-11 sm:text-xs"
      >
        {open ? "Hide debug" : "Show debug"}
      </button>

      {open && (
        <div className="pointer-events-auto max-h-[78vh] w-[min(96vw,72rem)] overflow-y-auto rounded-3xl border border-white/15 bg-black/75 p-3 shadow-2xl backdrop-blur-md sm:p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
                Block Inspector
              </p>
              <p className="truncate text-sm font-semibold text-white sm:text-base">
                {block.anchorId || `Block ${block.globalIndex + 1}`}
              </p>
            </div>

            <div className="shrink-0 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white/80 sm:text-[11px]">
              #{block.globalIndex + 1}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <SectionCard
              title="Block"
              tone="border-sky-300/30 bg-sky-500/15 text-sky-100"
            >
              <Field label="Id" value={block.id} />
              <Field label="Index" value={block.index} />
              <Field label="Entry Index" value={block.entryIndex} />
              <Field label="Part Index" value={block.partIndex} />
              <Field label="Global Index" value={block.globalIndex} />
              <Field label="Anchor" value={block.anchorId} />
              <Field label="Snap" value={block.isSnap ? "Yes" : "No"} />
              <Field
                label="Page Block"
                value={block.isPageBlock ? "Yes" : "No"}
              />
            </SectionCard>

            <SectionCard
              title="Section"
              tone="border-emerald-300/30 bg-emerald-500/15 text-emerald-100"
            >
              <Field label="Id" value={block.sectionId} />
              <Field label="Index" value={block.section.index} />
              <Field label="Direction" value={block.section.direction} />
              <Field label="Orientation" value={block.section.orientation} />
            </SectionCard>

            <SectionCard
              title="Part"
              tone="border-rose-300/30 bg-rose-500/15 text-rose-100"
            >
              <Field label="Id" value={block.partId} />
              <Field label="Index" value={block.part.index} />
              <Field label="Tale Id" value={block.part.taleId} />
            </SectionCard>

            <SectionCard
              title="Entry"
              tone="border-violet-300/30 bg-violet-500/15 text-violet-100"
            >
              <Field label="Id" value={block.entryId} />
              <Field label="Index" value={block.entry.index} />
              <Field label="Global Index" value={block.entry.globalIndex} />
            </SectionCard>

            <SectionCard
              title="Page"
              tone="border-pink-300/30 bg-pink-500/15 text-pink-100"
            >
              <Field label="Id" value={block.pageId} />
              <Field label="Index" value={block.page?.index} />
              <Field label="Global Index" value={block.page?.globalIndex} />
            </SectionCard>

            <SectionCard
              title="Flags"
              tone="border-amber-300/30 bg-amber-500/15 text-amber-100"
            >
              <Field label="First" value={block.isFirst ? "Yes" : "No"} />
              <Field label="Last" value={block.isLast ? "Yes" : "No"} />
              <Field
                label="First in Section"
                value={block.isFirstInSection ? "Yes" : "No"}
              />
              <Field
                label="Last in Section"
                value={block.isLastInSection ? "Yes" : "No"}
              />
              <Field
                label="First in Part"
                value={block.isFirstInPart ? "Yes" : "No"}
              />
              <Field
                label="Last in Part"
                value={block.isLastInPart ? "Yes" : "No"}
              />
              <Field
                label="First in Entry"
                value={block.isFirstInEntry ? "Yes" : "No"}
              />
              <Field
                label="Last in Entry"
                value={block.isLastInEntry ? "Yes" : "No"}
              />
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}

const TaleBlockDebugPanel = React.memo(TaleBlockDebugPanelComponent);
export default TaleBlockDebugPanel;