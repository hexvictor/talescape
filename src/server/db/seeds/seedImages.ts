import { createTable } from "~/server/db/schema-helpers";

// server/db/seed.ts

import { userId1 } from "./ids";
import { db } from "..";
import { images } from "../schema";

// You can call this in your main seed index file
export async function seedImages() {
  await db.insert(images).values([
    {
      name: "Image 1",
      url: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d",
      userId: userId1,
    },
  ]);

  console.log("✅ Images seeded!");
}
