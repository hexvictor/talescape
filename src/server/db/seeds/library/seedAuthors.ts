import { createTable } from "~/server/db/schema-helpers";

// server/db/seed.ts

import { db } from "../..";
import { authors } from "../../schema";

// You can call this in your main seed index file
export async function seedAuthors() {
  await db.insert(authors).values([
    {
      fullName: "Brandon Sanderson",
      firstName: "Brandon",
      lastName: "Sanderson",
      biography:
        "Brandon Winn Sanderson is an American author of high fantasy, science fiction, and young adult books. He is best known for the Cosmere fictional universe, in which most of his fantasy novels, most notably the Mistborn series and The Stormlight Archive, are set.",
      imageUrl:
        "https://www.brandonsanderson.com/cdn/shop/files/Screenshot_2024-07-26_at_11.59.47_AM.png?v=1722016793&width=480",
    },
  ]);

  console.log("✅ Authors seeded!");
}
