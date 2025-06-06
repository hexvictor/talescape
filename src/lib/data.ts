type NavigationMode = "buttons" | "keyboard" | "scroll" | "swipe";
export type TaleLayout = "scroll" | "scroll-snap" | "reel";

export type Tale = {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  bookId: string;
  type: "comic" | "novel" | "hybrid";
  navigationMode: NavigationMode[];
  layout: TaleLayout;
  orientation: "vertical" | "horizontal";
  entries: TaleEntry[];
  sections: TaleSection[];
};

export type TaleEntry = {
  id: string;
  title: string;
  type: EntryType;
  pages: TalePage[];
};

export type EntryType =
  | "cover"
  | "chapter"
  | "prologue"
  | "epilogue"
  | "timeline"
  | "codex"
  | "flashback"
  | "quote"
  | "dream"
  | "letter"
  | "interlude"
  | "map"
  | "table_of_contents"
  | "vocabulary"
  | "appendix"
  | "poem"
  | "note"
  | "unknown";

export type PageType =
  | "book"
  | "quote"
  | "illustration"
  | "map"
  | "timeline"
  | "custom";

export type TalePage = {
  id: string;
  firstPage: number;
  lastPage: number;
};

export type TaleSection = {
  id: string;
  blocks: TaleBlock[];
};

export type TaleBlock = {
  id: string;
  anchorId?: string;
  type: EntryType | PageType;
  fragments: TaleFragment[];
};

export type TaleFragment = {
  id: string;
  type: "text" | "image" | "audio" | "video";
  content: string;
};
export const tale: Tale = {
  id: "tale-001",
  creatorId: "user-123",
  title: "The Way of Kings",
  description:
    "An epic fantasy tale adapted from the novel by Brandon Sanderson.",
  bookId: "0",
  type: "novel",
  layout: "reel",
  orientation: "vertical",
  navigationMode: ["buttons", "keyboard", "swipe", "scroll"],
  entries: [
    {
      id: "c2b19d3c-89a5-4a21-959e-1513fe911755",
      title: "The Way of Kings",
      type: "cover",
      pages: [
        // {
        //   "id": "92cd98c2-8d40-4837-9aa7-1ff5b783de11",
        //   "firstPage": 1,
        //   "lastPage": 1
        // }
      ],
    },
    {
      id: "43708223-2520-4895-ab62-6d19420cdf89",
      title: "Prologue: The first Light",
      type: "prologue",
      pages: [
        {
          id: "83406608-1fb8-462d-b244-1bd589f2f8b0",
          firstPage: 1,
          lastPage: 4,
        },
        {
          id: "1564d99d-bae5-4b58-8f9a-545de1600c1a",
          firstPage: 5,
          lastPage: 5,
        },
        {
          id: "6584fe5c-fbec-4247-9f06-02a457aff4ee",
          firstPage: 6,
          lastPage: 11,
        },
      ],
    },
    {
      id: "c2b19d3c-89a5-4a21-959e-1513fe911748",
      title: "Stormblessed",
      type: "chapter",
      pages: [
        {
          id: "92cd98c2-8d40-4837-9aa7-1ff5b783de5e",
          firstPage: 12,
          lastPage: 39,
        },
      ],
    },
    {
      id: "6809d228-d909-4170-b0cb-4420cfc0ede7",
      title: "Honor is Dead",
      type: "chapter",
      pages: [
        {
          id: "e773d605-f037-45ef-b4d0-3f2258b8e047",
          firstPage: 40,
          lastPage: 71,
        },
      ],
    },
    {
      id: "7e5b5a22-fe63-4b5d-891b-59e58ed0d317",
      title: "The Blackthorn",
      type: "chapter",
      pages: [
        {
          id: "719b59d0-a483-42a0-8e84-36a8f78bd479",
          firstPage: 72,
          lastPage: 96,
        },
      ],
    },
    {
      id: "ebd507c5-c62e-4ace-91bb-d47802198a34",
      title: "Logbook: Battle Report",
      type: "interlude",
      pages: [
        {
          id: "9b2b9a9f-d00f-4cb7-ae73-534bf2d543b6",
          firstPage: 97,
          lastPage: 100,
        },
      ],
    },
    {
      id: "e899540a-d924-4818-b605-4fcdaedfeb4f",
      title: "Letter from the King",
      type: "letter",
      pages: [
        {
          id: "32417562-7883-4755-8bd7-17ab02b97bcc",
          firstPage: 101,
          lastPage: 103,
        },
      ],
    },
    {
      id: "c860dd94-1377-48ee-b3ca-8665ea82040a",
      title: "The Shattered Plains",
      type: "chapter",
      pages: [
        {
          id: "eb64b567-0242-4ba6-98fb-fa372d36d5e0",
          firstPage: 104,
          lastPage: 133,
        },
      ],
    },
    {
      id: "405b5fcb-980d-4475-931d-68d07f0d8f98",
      title: "The Tower",
      type: "chapter",
      pages: [
        {
          id: "2a21b81c-3b04-4ee4-a5be-691349ffcb54",
          firstPage: 134,
          lastPage: 168,
        },
      ],
    },
    {
      id: "428cc211-92fc-4fe2-b47d-dc027531bee3",
      title: "Dream of Stormlight",
      type: "dream",
      pages: [
        {
          id: "caf02050-f19e-4872-861d-15dec0ec4749",
          firstPage: 169,
          lastPage: 173,
        },
      ],
    },
    {
      id: "3011665f-7c38-4360-b3e2-9ed4a653e770",
      title: "The King's Wit",
      type: "chapter",
      pages: [
        {
          id: "d5d60371-0630-4bfa-b755-5596ecdbbc3e",
          firstPage: 174,
          lastPage: 195,
        },
      ],
    },
    {
      id: "8c00a31e-bb1f-4227-8132-891ea546a556",
      title: "Quote: Words of Radiance",
      type: "quote",
      pages: [
        {
          id: "62315535-b529-4c58-a9b9-565ec01e2472",
          firstPage: 196,
          lastPage: 196,
        },
      ],
    },
    {
      id: "477f2b9a-d5c7-48e6-848c-e1720e5edb9b",
      title: "Highstorm",
      type: "chapter",
      pages: [
        {
          id: "1b5ec6cb-f216-47f7-be63-9090617967f9",
          firstPage: 197,
          lastPage: 222,
        },
      ],
    },
    {
      id: "2ae90894-9735-4dfd-94fe-d6cca2b87c43",
      title: "Bridge Four",
      type: "chapter",
      pages: [
        {
          id: "8e7f3f50-3e62-4234-9fc5-024bec337e1d",
          firstPage: 223,
          lastPage: 253,
        },
      ],
    },
    {
      id: "68db81a2-9fe1-426c-b824-bc8bd9a43b93",
      title: "Map of the Shattered Plains",
      type: "map",
      pages: [
        {
          id: "4671c741-72b3-484f-9dbf-b205488279b7",
          firstPage: 254,
          lastPage: 255,
        },
      ],
    },
    {
      id: "ec4ce699-fecb-4a8e-a3d3-4169138c2920",
      title: "Kaladin's Oath",
      type: "chapter",
      pages: [
        {
          id: "307b2a79-99e6-4924-8ac9-f246926f25dc",
          firstPage: 256,
          lastPage: 284,
        },
      ],
    },
    {
      id: "39503645-d85e-4002-a05e-4a8e34a260ae",
      title: "The Shardbearer",
      type: "chapter",
      pages: [
        {
          id: "a174ea69-7dc6-44c8-ac2b-1d2de6eb7d06",
          firstPage: 285,
          lastPage: 317,
        },
      ],
    },
    {
      id: "394efa1d-b2bd-44f9-9bb5-ff6fae277d69",
      title: "Flashback: Gavilar's last Words",
      type: "flashback",
      pages: [
        {
          id: "c3e26d31-6935-4f01-aa66-fdb36642ad05",
          firstPage: 318,
          lastPage: 320,
        },
      ],
    },
    {
      id: "d1124c60-2f96-46cd-9efb-d3848b3cf3f1",
      title: "Dalinar's Vision",
      type: "chapter",
      pages: [
        {
          id: "cf4f4b3e-1db1-4af1-a928-562cb42cc9e1",
          firstPage: 321,
          lastPage: 347,
        },
      ],
    },
    {
      id: "107db3c4-e62f-49df-8852-15e134070d8e",
      title: "Codex: Voidbinding",
      type: "codex",
      pages: [
        {
          id: "afe08105-00ec-43d9-b523-b476ac2c5c4e",
          firstPage: 348,
          lastPage: 353,
        },
      ],
    },
    {
      id: "4679e3cf-6e84-46b9-98dc-6925188f3085",
      title: "The Weeping",
      type: "chapter",
      pages: [
        {
          id: "f01797e6-b2d5-44d0-9c80-2fc1d966b0ef",
          firstPage: 354,
          lastPage: 377,
        },
      ],
    },
    {
      id: "6c27e265-653e-4bbd-85e9-5eb524a9ac74",
      title: "The Parshendi",
      type: "chapter",
      pages: [
        {
          id: "ce5b21af-6611-4e1d-a6b0-99491751d659",
          firstPage: 378,
          lastPage: 407,
        },
      ],
    },
    {
      id: "ea6a0d73-17b0-4d3c-a8be-af04469f54d1",
      title: "Table of contents",
      type: "table_of_contents",
      pages: [
        {
          id: "c7ad76ae-1e88-4f8e-86bd-44191ca2b0d1",
          firstPage: 408,
          lastPage: 409,
        },
      ],
    },
    {
      id: "0c2fa9a2-fd8e-4723-a433-fc2a6744bf7a",
      title: "Vocabulary Guide",
      type: "vocabulary",
      pages: [
        {
          id: "6468ad0c-5071-4434-9b4e-e9e19ce7db08",
          firstPage: 410,
          lastPage: 412,
        },
      ],
    },
    {
      id: "3c66f2b0-7cff-4d68-918f-aec0faf59ed8",
      title: "The Assassin",
      type: "chapter",
      pages: [
        {
          id: "e124ff13-9c56-42d1-950e-d979bbff62ab",
          firstPage: 413,
          lastPage: 440,
        },
      ],
    },
    {
      id: "e2c5948d-8679-4cd0-a0e3-6de2cf60a4b4",
      title: "The Kholin Family",
      type: "chapter",
      pages: [
        {
          id: "0709f8bc-4a33-4342-a774-c99a054545f1",
          firstPage: 441,
          lastPage: 472,
        },
      ],
    },
    {
      id: "fb8d1556-71c8-41c4-84f4-0d8f7e063d30",
      title: "Timeline: War of Reckoning",
      type: "timeline",
      pages: [
        {
          id: "fdddf7f7-d6f9-4f3f-886f-1db8298b6aef",
          firstPage: 473,
          lastPage: 474,
        },
      ],
    },
    {
      id: "74902349-6d46-46e6-9049-7651a0a752fe",
      title: "Appendix A: Spren types",
      type: "appendix",
      pages: [
        {
          id: "cd5a6e68-ba52-4b12-9788-74aaf83c76f2",
          firstPage: 475,
          lastPage: 478,
        },
      ],
    },
    {
      id: "637fa37f-d3da-436d-bfa9-fa22e57f3e3e",
      title: "Epilogue: A New Oath",
      type: "epilogue",
      pages: [
        {
          id: "f065df1c-4f12-4fe3-8b38-76875ca9ec14",
          firstPage: 479,
          lastPage: 484,
        },
      ],
    },
    {
      id: "4c2ee187-980b-46c3-9bbb-67f45f3271dd",
      title: "Poem: The Words Forgotten",
      type: "poem",
      pages: [
        {
          id: "1291f6d3-2a36-45e9-bd2c-857a03ed8b0a",
          firstPage: 485,
          lastPage: 485,
        },
      ],
    },
    {
      id: "a5d77285-d6a2-42fb-afc0-da2e4ff956d0",
      title: "Author's Note",
      type: "note",
      pages: [
        {
          id: "95c664ea-4a39-49ef-bd27-7777df17a191",
          firstPage: 486,
          lastPage: 487,
        },
      ],
    },
  ],
  sections: [
    {
      id: "beb16111-85dd-4a89-b4cf-442131abcdf4",
      blocks: [
        {
          id: "d6d01cbd-a40c-435b-8f56-7a42ac71af79",
          anchorId: "anchor-c2b19d3c-89a5-4a21-959e-1513fe911755",
          type: "cover",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        // {
        //   "id": "6aca759d-a16e-4bc6-87d1-ceabbb7d19a1",
        //   "anchorId": "anchor-92cd98c2-8d40-4837-9aa7-1ff5b783de11",
        //   "type": "book",
        //   "fragments": [
        // 	{
        // 	  "id": "d7a01582-3b44-4808-9275-8028c81b0ehh",
        // 	  "type": "text",
        // 	  "content": "Sample content for pages 12\u201339"
        // 	}
        //   ]
        // },
        // {
        //   id: "08e01d29-83a6-41b0-8342-af806a530943",
        //   anchorId: "anchor-43708223-2520-4895-ab62-6d19420cdf89",
        //   type: "prologue",
        //   fragments: [
        //     {
        //       id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
        //       type: "text",
        //       content: "Entry",
        //     },
        //   ],
        // },
        {
          id: "16f1fa41-b94f-43cc-8ae0-747e3d3a2cc5",
          anchorId: "anchor-83406608-1fb8-462d-b244-1bd589f2f8b0",
          type: "book",
          fragments: [
            {
              id: "85bcdd13-5284-40b5-97f9-f6acde278045",
              type: "text",
              content: "Sample content for pages 1\u20134",
            },
          ],
        },
        {
          id: "7bbaa77b-25f5-4964-8703-b57a07c23adf",
          anchorId: "anchor-1564d99d-bae5-4b58-8f9a-545de1600c1a",
          type: "book",
          fragments: [
            {
              id: "946c20b6-88f4-44d4-9e9c-edee09ccbbbc",
              type: "text",
              content: "Sample content for pages 5\u20135",
            },
          ],
        },
        {
          id: "c315e0ba-5f2a-4a98-b85c-ad762c67c93e",
          anchorId: "anchor-6584fe5c-fbec-4247-9f06-02a457aff4ee",
          type: "book",
          fragments: [
            {
              id: "962d9d00-17e0-4cc6-bfc4-aa2fecf7f765",
              type: "text",
              content: "Sample content for pages 6\u201311",
            },
          ],
        },
        {
          id: "c09dc9d7-6e35-4da0-aed8-775d10c63541",
          anchorId: "anchor-c2b19d3c-89a5-4a21-959e-1513fe911748",
          type: "chapter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "93c87bac-8e0d-4c2b-8431-22fd17098935",
          anchorId: "anchor-92cd98c2-8d40-4837-9aa7-1ff5b783de5e",
          type: "book",
          fragments: [
            {
              id: "d7a01582-3b44-4808-9275-8028c81b0e9d",
              type: "text",
              content: "Sample content for pages 12\u201339",
            },
          ],
        },
        {
          id: "54973454-67a9-45bc-9cd0-e22f509c7d46",
          anchorId: "anchor-6809d228-d909-4170-b0cb-4420cfc0ede7",
          type: "chapter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "a8aeedda-5164-422b-b7c5-f46391a71cdb",
          anchorId: "anchor-e773d605-f037-45ef-b4d0-3f2258b8e047",
          type: "book",
          fragments: [
            {
              id: "6bd89c14-e13b-4fcd-bc0f-3eb36b65cc11",
              type: "text",
              content: "Sample content for pages 40\u201371",
            },
          ],
        },
        {
          id: "4e078cf9-3d4c-4f11-b83b-1ced31cac1ee",
          anchorId: "anchor-7e5b5a22-fe63-4b5d-891b-59e58ed0d317",
          type: "chapter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "423a5ec6-b038-4501-b54e-bd3e81bfc2dc",
          anchorId: "anchor-719b59d0-a483-42a0-8e84-36a8f78bd479",
          type: "book",
          fragments: [
            {
              id: "0f2cf417-446d-483a-9ccc-b1f696a945e7",
              type: "text",
              content: "Sample content for pages 72\u201396",
            },
          ],
        },
        {
          id: "ff8195c3-189d-4bec-855a-9cc61b16068b",
          anchorId: "anchor-ebd507c5-c62e-4ace-91bb-d47802198a34",
          type: "interlude",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "0d9df391-4450-4859-b9ea-b9969513deb4",
          anchorId: "anchor-9b2b9a9f-d00f-4cb7-ae73-534bf2d543b6",
          type: "book",
          fragments: [
            {
              id: "548fca8b-cc2a-4576-8a45-85535d29f21c",
              type: "text",
              content: "Sample content for pages 97\u2013100",
            },
          ],
        },
        {
          id: "5179c4c4-ad3f-4f12-859e-0d9638555385",
          anchorId: "anchor-e899540a-d924-4818-b605-4fcdaedfeb4f",
          type: "letter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "c338fa1a-e98f-4cc8-a287-804d57ce64fa",
          anchorId: "anchor-32417562-7883-4755-8bd7-17ab02b97bcc",
          type: "book",
          fragments: [
            {
              id: "6856443e-1e0c-42ce-ae63-5ffd6906757e",
              type: "text",
              content: "Sample content for pages 101\u2013103",
            },
          ],
        },
        {
          id: "ccb4385a-074a-4f4f-be87-754f6ff1959f",
          anchorId: "anchor-c860dd94-1377-48ee-b3ca-8665ea82040a",
          type: "chapter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "0d3603e2-0fe9-40f6-80e4-5a5d991aabe7",
          anchorId: "anchor-eb64b567-0242-4ba6-98fb-fa372d36d5e0",
          type: "book",
          fragments: [
            {
              id: "b8d2b313-0d6a-4109-b410-b98f1b11f535",
              type: "text",
              content: "Sample content for pages 104\u2013133",
            },
          ],
        },
        {
          id: "083ce9dd-623d-4f40-bbea-9d29dfdf1524",
          anchorId: "anchor-405b5fcb-980d-4475-931d-68d07f0d8f98",
          type: "chapter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "93674c21-7c96-4541-985a-0bee771276fb",
          anchorId: "anchor-2a21b81c-3b04-4ee4-a5be-691349ffcb54",
          type: "book",
          fragments: [
            {
              id: "74b61eed-fa1d-45e9-9352-f39c51410980",
              type: "text",
              content: "Sample content for pages 134\u2013168",
            },
          ],
        },
        {
          id: "bf3f427e-9327-4994-b941-7fc826d295d8",
          anchorId: "anchor-428cc211-92fc-4fe2-b47d-dc027531bee3",
          type: "dream",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "fa9f83e7-2569-4573-9820-8043f1e0b36f",
          anchorId: "anchor-caf02050-f19e-4872-861d-15dec0ec4749",
          type: "book",
          fragments: [
            {
              id: "48150b53-e330-467a-bb1e-63f84b264df4",
              type: "text",
              content: "Sample content for pages 169\u2013173",
            },
          ],
        },
        {
          id: "afdd0a2b-6143-43d3-ad9a-77c80b6dadb1",
          anchorId: "anchor-3011665f-7c38-4360-b3e2-9ed4a653e770",
          type: "chapter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "fdc99a63-00fe-425b-a665-ea8d43e37e3f",
          anchorId: "anchor-d5d60371-0630-4bfa-b755-5596ecdbbc3e",
          type: "book",
          fragments: [
            {
              id: "e20362a2-cbbc-484c-ae0f-11424395124c",
              type: "text",
              content: "Sample content for pages 174\u2013195",
            },
          ],
        },
        {
          id: "8c7ac3e6-5579-4c75-9b46-7ac4e35ca03f",
          anchorId: "anchor-8c00a31e-bb1f-4227-8132-891ea546a556",
          type: "quote",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "cea986d8-d568-44f5-a5f7-457febc35c42",
          anchorId: "anchor-62315535-b529-4c58-a9b9-565ec01e2472",
          type: "book",
          fragments: [
            {
              id: "9ee04ee5-57b2-47cf-b151-a9c5e46ea401",
              type: "text",
              content: "Sample content for pages 196\u2013196",
            },
          ],
        },
        {
          id: "db7548d7-0413-4dc6-b144-6eead02d27e0",
          anchorId: "anchor-477f2b9a-d5c7-48e6-848c-e1720e5edb9b",
          type: "chapter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "1d635175-1b6e-48c7-9c4b-25f9c49e82c0",
          anchorId: "anchor-1b5ec6cb-f216-47f7-be63-9090617967f9",
          type: "book",
          fragments: [
            {
              id: "a9dff59f-f1f6-4c0e-9219-4a8e60e98adf",
              type: "text",
              content: "Sample content for pages 197\u2013222",
            },
          ],
        },
        {
          id: "4450657d-e8cc-4d2f-a556-dfabcb5fc864",
          anchorId: "anchor-2ae90894-9735-4dfd-94fe-d6cca2b87c43",
          type: "chapter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "1ebbf205-2121-46ff-ae6c-92aeb580eec0",
          anchorId: "anchor-8e7f3f50-3e62-4234-9fc5-024bec337e1d",
          type: "book",
          fragments: [
            {
              id: "620d1e47-a3ec-4b57-9ea7-b0a53daa5a1e",
              type: "text",
              content: "Sample content for pages 223\u2013253",
            },
          ],
        },
        {
          id: "d3a6a2fc-907f-4302-bf6b-bfa665ebdfbf",
          anchorId: "anchor-68db81a2-9fe1-426c-b824-bc8bd9a43b93",
          type: "map",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "80411992-9e49-44a2-aa25-80f5e0afc5ea",
          anchorId: "anchor-4671c741-72b3-484f-9dbf-b205488279b7",
          type: "book",
          fragments: [
            {
              id: "ad796aac-3c1e-4610-8c4c-3c80e23ffbe2",
              type: "text",
              content: "Sample content for pages 254\u2013255",
            },
          ],
        },
        {
          id: "a9ee1aca-bedf-48db-acdd-c6253f474b75",
          anchorId: "anchor-ec4ce699-fecb-4a8e-a3d3-4169138c2920",
          type: "chapter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "023c3011-adab-45ef-a6fb-44d83dd9ebba",
          anchorId: "anchor-307b2a79-99e6-4924-8ac9-f246926f25dc",
          type: "book",
          fragments: [
            {
              id: "57963a00-b390-4bcc-ad37-2918ec99b4a5",
              type: "text",
              content: "Sample content for pages 256\u2013284",
            },
          ],
        },
        {
          id: "9e196200-414a-4c92-97a7-74c8f3376b08",
          anchorId: "anchor-39503645-d85e-4002-a05e-4a8e34a260ae",
          type: "chapter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "6eebdd7c-307e-427c-aaee-bb2e8a6751ea",
          anchorId: "anchor-a174ea69-7dc6-44c8-ac2b-1d2de6eb7d06",
          type: "book",
          fragments: [
            {
              id: "a8e8dc18-b3e4-4d71-94ac-975db02ea102",
              type: "text",
              content: "Sample content for pages 285\u2013317",
            },
          ],
        },
        {
          id: "e21f5648-16c4-4edc-91ff-a50758da9f7c",
          anchorId: "anchor-394efa1d-b2bd-44f9-9bb5-ff6fae277d69",
          type: "flashback",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "bfa854e4-1f9f-4923-a0c1-c6106f4f89d3",
          anchorId: "anchor-c3e26d31-6935-4f01-aa66-fdb36642ad05",
          type: "book",
          fragments: [
            {
              id: "437558c5-5c0b-4fac-8b94-1088663c3965",
              type: "text",
              content: "Sample content for pages 318\u2013320",
            },
          ],
        },
        {
          id: "7b113c0f-1e83-42d0-91b5-0accbd2c25b4",
          anchorId: "anchor-d1124c60-2f96-46cd-9efb-d3848b3cf3f1",
          type: "chapter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "12fdccf0-4796-4272-a898-18b7c8d81462",
          anchorId: "anchor-cf4f4b3e-1db1-4af1-a928-562cb42cc9e1",
          type: "book",
          fragments: [
            {
              id: "634db24a-7b21-4ccf-b982-fc017cce7691",
              type: "text",
              content: "Sample content for pages 321\u2013347",
            },
          ],
        },
        {
          id: "56695eb6-879c-4689-bf8d-e55824a840d6",
          anchorId: "anchor-107db3c4-e62f-49df-8852-15e134070d8e",
          type: "codex",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "0efb8019-a389-407e-bf30-ea2bec5f0a60",
          anchorId: "anchor-afe08105-00ec-43d9-b523-b476ac2c5c4e",
          type: "book",
          fragments: [
            {
              id: "a08183dc-ec6b-4fc9-82ff-96bbc200cdec",
              type: "text",
              content: "Sample content for pages 348\u2013353",
            },
          ],
        },
        {
          id: "c7af076f-1faf-499b-b435-5ba65da5c1fd",
          anchorId: "anchor-4679e3cf-6e84-46b9-98dc-6925188f3085",
          type: "chapter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "1950f1b2-40e5-49ec-94cd-75f5c41de223",
          anchorId: "anchor-f01797e6-b2d5-44d0-9c80-2fc1d966b0ef",
          type: "book",
          fragments: [
            {
              id: "61b3ecd7-5f50-4f1b-87c1-6a1ccdfb0b79",
              type: "text",
              content: "Sample content for pages 354\u2013377",
            },
          ],
        },
        {
          id: "44ab3e07-1e9e-4794-99c4-32d492f23670",
          anchorId: "anchor-6c27e265-653e-4bbd-85e9-5eb524a9ac74",
          type: "chapter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "2965c749-334d-49c8-90e8-a0664e623e0e",
          anchorId: "anchor-ce5b21af-6611-4e1d-a6b0-99491751d659",
          type: "book",
          fragments: [
            {
              id: "78bbd471-cc6a-4dc5-8faf-1bac642dedf1",
              type: "text",
              content: "Sample content for pages 378\u2013407",
            },
          ],
        },
        {
          id: "bc7bc0cd-a2b2-402a-ac67-6c2b985f7664",
          anchorId: "anchor-ea6a0d73-17b0-4d3c-a8be-af04469f54d1",
          type: "table_of_contents",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "694118c5-0aa3-43cc-a834-ae00357ac75a",
          anchorId: "anchor-c7ad76ae-1e88-4f8e-86bd-44191ca2b0d1",
          type: "book",
          fragments: [
            {
              id: "88c10d61-cd56-490b-9cbb-dcdf7480ac74",
              type: "text",
              content: "Sample content for pages 408\u2013409",
            },
          ],
        },
        {
          id: "5472db27-db93-497d-8cc3-9600e72f95d1",
          anchorId: "anchor-0c2fa9a2-fd8e-4723-a433-fc2a6744bf7a",
          type: "vocabulary",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "d82dbc57-8fe7-4b49-b3fc-cf48445a3b11",
          anchorId: "anchor-6468ad0c-5071-4434-9b4e-e9e19ce7db08",
          type: "book",
          fragments: [
            {
              id: "39710dc2-728c-4114-b6fa-8bccd6b42599",
              type: "text",
              content: "Sample content for pages 410\u2013412",
            },
          ],
        },
        {
          id: "5a8c82d3-bfc9-400a-9ea5-a80737d73e86",
          anchorId: "anchor-3c66f2b0-7cff-4d68-918f-aec0faf59ed8",
          type: "chapter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "33c8d903-591d-4e07-a761-f8aec2fd1afd",
          anchorId: "anchor-e124ff13-9c56-42d1-950e-d979bbff62ab",
          type: "book",
          fragments: [
            {
              id: "8812acf6-2e58-4564-999b-1e97b4eece71",
              type: "text",
              content: "Sample content for pages 413\u2013440",
            },
          ],
        },
        {
          id: "19073c71-01b2-4528-915a-6a0c864fc1fb",
          anchorId: "anchor-e2c5948d-8679-4cd0-a0e3-6de2cf60a4b4",
          type: "chapter",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "09770d20-2e17-496c-b6cd-31b8c17fc77c",
          anchorId: "anchor-0709f8bc-4a33-4342-a774-c99a054545f1",
          type: "book",
          fragments: [
            {
              id: "f5478607-c034-49a0-a7ff-ef82d595472e",
              type: "text",
              content: "Sample content for pages 441\u2013472",
            },
          ],
        },
        {
          id: "97d95417-8f28-4d28-afcf-3a2c5e58a483",
          anchorId: "anchor-fb8d1556-71c8-41c4-84f4-0d8f7e063d30",
          type: "timeline",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "156de686-c86f-4bae-b43f-a26d176cb5be",
          anchorId: "anchor-fdddf7f7-d6f9-4f3f-886f-1db8298b6aef",
          type: "book",
          fragments: [
            {
              id: "974ff540-8457-469d-b785-34bb5eb69165",
              type: "text",
              content: "Sample content for pages 473\u2013474",
            },
          ],
        },
        {
          id: "81cdaae7-0321-4544-9927-c42853907ca4",
          anchorId: "anchor-74902349-6d46-46e6-9049-7651a0a752fe",
          type: "appendix",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "4affe778-301e-44be-b304-8644857b14a8",
          anchorId: "anchor-cd5a6e68-ba52-4b12-9788-74aaf83c76f2",
          type: "book",
          fragments: [
            {
              id: "c7df3184-a1df-4d3a-a1c2-68227e62b22b",
              type: "text",
              content: "Sample content for pages 475\u2013478",
            },
          ],
        },
        {
          id: "f570c17b-eea2-4eb6-b10a-0ed0cb1e6273",
          anchorId: "anchor-637fa37f-d3da-436d-bfa9-fa22e57f3e3e",
          type: "epilogue",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "aec2133c-7b7c-4b48-b87f-acf48df94199",
          anchorId: "anchor-f065df1c-4f12-4fe3-8b38-76875ca9ec14",
          type: "book",
          fragments: [
            {
              id: "521bd97a-1deb-45c1-b233-69c3eac6adc4",
              type: "text",
              content: "Sample content for pages 479\u2013484",
            },
          ],
        },
        {
          id: "e437c2dc-fb82-425c-bdde-b8517a52271b",
          anchorId: "anchor-4c2ee187-980b-46c3-9bbb-67f45f3271dd",
          type: "poem",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "c990f975-9dde-4fdd-a423-0436680feaef",
          anchorId: "anchor-1291f6d3-2a36-45e9-bd2c-857a03ed8b0a",
          type: "book",
          fragments: [
            {
              id: "b8bfe448-2824-49d7-807c-2ac436fc57d9",
              type: "text",
              content: "Sample content for pages 485\u2013485",
            },
          ],
        },
        {
          id: "16b2a4ae-a721-40e7-8dae-a9f0dc3ddb16",
          anchorId: "anchor-a5d77285-d6a2-42fb-afc0-da2e4ff956d0",
          type: "note",
          fragments: [
            {
              id: "85bcdd13-5284-4dd0b5-97f9-f6acde278045",
              type: "text",
              content: "Entry",
            },
          ],
        },
        {
          id: "0664f4aa-ae85-4ffa-b4e7-754291c3d0ed",
          anchorId: "anchor-95c664ea-4a39-49ef-bd27-7777df17a191",
          type: "book",
          fragments: [
            {
              id: "cdcf222d-1632-4f6e-9fce-27636adc10bc",
              type: "text",
              content: "Sample content for pages 486\u2013487",
            },
          ],
        },
      ],
    },
  ],
};
