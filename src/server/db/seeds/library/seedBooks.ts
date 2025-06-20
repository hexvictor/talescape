import { createTable } from "~/server/db/schema-helpers";

// server/db/seed.ts

import { db } from "../..";
import { books } from "../../schema";

// You can call this in your main seed index file
export async function seedBooks() {
  await db.insert(books).values([
    {
      title: "The Way of Kings",
      authorId: 1,
      description:
        "The Way of Kings is an epic fantasy novel written by American author Brandon Sanderson and the first book in The Stormlight Archive series.",
      coverImageUrl:
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1659905828i/7235533.jpg",
      type: "official",
      status: "published",
    },
  ]);

  console.log("✅ Books seeded!");
}
