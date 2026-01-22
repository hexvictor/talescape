import type { AssetVisibility } from "~/server/db/types/tale-builder/asset";
import type { TaleType } from "~/server/db/types/tale-reader/tale";

export class TaleAccessError extends Error {
  status: number;
  partialTale?: {
    id: number;
    title: string;
    slug: string;
    visibility: AssetVisibility;
    type: TaleType;
  };

  constructor(
    message: string,
    status: number,
    partialTale?: TaleAccessError["partialTale"]
  ) {
    super(message);
    this.name = "TaleAccessError";
    this.status = status;
    if (partialTale) this.partialTale = partialTale;
  }
}
