import type { AssetVisibility } from "~/types/schema/tale-builder/asset";
import type { TaleType } from "~/types/schema/tale-reader/tale";

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
