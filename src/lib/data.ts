import type { Book } from "~/server/db/schema";

export const bookEntries: BookEntry[] = [
	{
		id: "c2b19d3c-89a5-4a21-959e-1513fe911755",
		title: "The Way of Kings",
		type: "cover",
		pages: [
			{
				id: "92cd98c2-8d40-4837-9aa7-1ff5b783de11",
				bookPages: 1,
				type: "book",
				firstPage: 1,
				lastPage: 1,
				fragments: [
					{
						id: "d7a01582-3b44-4808-9275-8028c81b0ehh",
						type: "text",
						content: "Sample content for pages 12\u201339",
					},
				],
			},
		],
	},
	{
		id: "43708223-2520-4895-ab62-6d19420cdf89",
		title: "Prologue: The First Light",
		type: "prologue",
		pages: [
			{
				id: "83406608-1fb8-462d-b244-1bd589f2f8b0",
				bookPages: 3,
				type: "book",
				firstPage: 2,
				lastPage: 4,
				fragments: [
					{
						id: "85bcdd13-5284-40b5-97f9-f6acde278045",
						type: "text",
						content: "Sample content for pages 1\u20134",
					},
				],
			},
			{
				id: "1564d99d-bae5-4b58-8f9a-545de1600c1a",
				bookPages: 1,
				type: "book",
				firstPage: 5,
				lastPage: 5,
				fragments: [
					{
						id: "946c20b6-88f4-44d4-9e9c-edee09ccbbbc",
						type: "text",
						content: "Sample content for pages 5\u20135",
					},
				],
			},
			{
				id: "6584fe5c-fbec-4247-9f06-02a457aff4ee",
				bookPages: 6,
				type: "book",
				firstPage: 6,
				lastPage: 11,
				fragments: [
					{
						id: "962d9d00-17e0-4cc6-bfc4-aa2fecf7f765",
						type: "text",
						content: "Sample content for pages 6\u201311",
					},
				],
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
				bookPages: 28,
				type: "book",
				firstPage: 12,
				lastPage: 39,
				fragments: [
					{
						id: "d7a01582-3b44-4808-9275-8028c81b0e9d",
						type: "text",
						content: "Sample content for pages 12\u201339",
					},
				],
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
				bookPages: 32,
				type: "book",
				firstPage: 40,
				lastPage: 71,
				fragments: [
					{
						id: "6bd89c14-e13b-4fcd-bc0f-3eb36b65cc11",
						type: "text",
						content: "Sample content for pages 40\u201371",
					},
				],
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
				bookPages: 25,
				type: "book",
				firstPage: 72,
				lastPage: 96,
				fragments: [
					{
						id: "0f2cf417-446d-483a-9ccc-b1f696a945e7",
						type: "text",
						content: "Sample content for pages 72\u201396",
					},
				],
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
				bookPages: 4,
				type: "book",
				firstPage: 97,
				lastPage: 100,
				fragments: [
					{
						id: "548fca8b-cc2a-4576-8a45-85535d29f21c",
						type: "text",
						content: "Sample content for pages 97\u2013100",
					},
				],
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
				bookPages: 3,
				type: "book",
				firstPage: 101,
				lastPage: 103,
				fragments: [
					{
						id: "6856443e-1e0c-42ce-ae63-5ffd6906757e",
						type: "text",
						content: "Sample content for pages 101\u2013103",
					},
				],
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
				bookPages: 30,
				type: "book",
				firstPage: 104,
				lastPage: 133,
				fragments: [
					{
						id: "b8d2b313-0d6a-4109-b410-b98f1b11f535",
						type: "text",
						content: "Sample content for pages 104\u2013133",
					},
				],
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
				bookPages: 35,
				type: "book",
				firstPage: 134,
				lastPage: 168,
				fragments: [
					{
						id: "74b61eed-fa1d-45e9-9352-f39c51410980",
						type: "text",
						content: "Sample content for pages 134\u2013168",
					},
				],
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
				bookPages: 5,
				type: "book",
				firstPage: 169,
				lastPage: 173,
				fragments: [
					{
						id: "48150b53-e330-467a-bb1e-63f84b264df4",
						type: "text",
						content: "Sample content for pages 169\u2013173",
					},
				],
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
				bookPages: 22,
				type: "book",
				firstPage: 174,
				lastPage: 195,
				fragments: [
					{
						id: "e20362a2-cbbc-484c-ae0f-11424395124c",
						type: "text",
						content: "Sample content for pages 174\u2013195",
					},
				],
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
				bookPages: 1,
				type: "book",
				firstPage: 196,
				lastPage: 196,
				fragments: [
					{
						id: "9ee04ee5-57b2-47cf-b151-a9c5e46ea401",
						type: "text",
						content: "Sample content for pages 196\u2013196",
					},
				],
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
				bookPages: 26,
				type: "book",
				firstPage: 197,
				lastPage: 222,
				fragments: [
					{
						id: "a9dff59f-f1f6-4c0e-9219-4a8e60e98adf",
						type: "text",
						content: "Sample content for pages 197\u2013222",
					},
				],
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
				bookPages: 31,
				type: "book",
				firstPage: 223,
				lastPage: 253,
				fragments: [
					{
						id: "620d1e47-a3ec-4b57-9ea7-b0a53daa5a1e",
						type: "text",
						content: "Sample content for pages 223\u2013253",
					},
				],
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
				bookPages: 2,
				type: "book",
				firstPage: 254,
				lastPage: 255,
				fragments: [
					{
						id: "ad796aac-3c1e-4610-8c4c-3c80e23ffbe2",
						type: "text",
						content: "Sample content for pages 254\u2013255",
					},
				],
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
				bookPages: 29,
				type: "book",
				firstPage: 256,
				lastPage: 284,
				fragments: [
					{
						id: "57963a00-b390-4bcc-ad37-2918ec99b4a5",
						type: "text",
						content: "Sample content for pages 256\u2013284",
					},
				],
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
				bookPages: 33,
				type: "book",
				firstPage: 285,
				lastPage: 317,
				fragments: [
					{
						id: "a8e8dc18-b3e4-4d71-94ac-975db02ea102",
						type: "text",
						content: "Sample content for pages 285\u2013317",
					},
				],
			},
		],
	},
	{
		id: "394efa1d-b2bd-44f9-9bb5-ff6fae277d69",
		title: "Flashback: Gavilar's Last Words",
		type: "flashback",
		pages: [
			{
				id: "c3e26d31-6935-4f01-aa66-fdb36642ad05",
				bookPages: 3,
				type: "book",
				firstPage: 318,
				lastPage: 320,
				fragments: [
					{
						id: "437558c5-5c0b-4fac-8b94-1088663c3965",
						type: "text",
						content: "Sample content for pages 318\u2013320",
					},
				],
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
				bookPages: 27,
				type: "book",
				firstPage: 321,
				lastPage: 347,
				fragments: [
					{
						id: "634db24a-7b21-4ccf-b982-fc017cce7691",
						type: "text",
						content: "Sample content for pages 321\u2013347",
					},
				],
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
				bookPages: 6,
				type: "book",
				firstPage: 348,
				lastPage: 353,
				fragments: [
					{
						id: "a08183dc-ec6b-4fc9-82ff-96bbc200cdec",
						type: "text",
						content: "Sample content for pages 348\u2013353",
					},
				],
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
				bookPages: 24,
				type: "book",
				firstPage: 354,
				lastPage: 377,
				fragments: [
					{
						id: "61b3ecd7-5f50-4f1b-87c1-6a1ccdfb0b79",
						type: "text",
						content: "Sample content for pages 354\u2013377",
					},
				],
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
				bookPages: 30,
				type: "book",
				firstPage: 378,
				lastPage: 407,
				fragments: [
					{
						id: "78bbd471-cc6a-4dc5-8faf-1bac642dedf1",
						type: "text",
						content: "Sample content for pages 378\u2013407",
					},
				],
			},
		],
	},
	{
		id: "ea6a0d73-17b0-4d3c-a8be-af04469f54d1",
		title: "Table of Contents",
		type: "table_of_contents",
		pages: [
			{
				id: "c7ad76ae-1e88-4f8e-86bd-44191ca2b0d1",
				bookPages: 2,
				type: "book",
				firstPage: 408,
				lastPage: 409,
				fragments: [
					{
						id: "88c10d61-cd56-490b-9cbb-dcdf7480ac74",
						type: "text",
						content: "Sample content for pages 408\u2013409",
					},
				],
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
				bookPages: 3,
				type: "book",
				firstPage: 410,
				lastPage: 412,
				fragments: [
					{
						id: "39710dc2-728c-4114-b6fa-8bccd6b42599",
						type: "text",
						content: "Sample content for pages 410\u2013412",
					},
				],
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
				bookPages: 28,
				type: "book",
				firstPage: 413,
				lastPage: 440,
				fragments: [
					{
						id: "8812acf6-2e58-4564-999b-1e97b4eece71",
						type: "text",
						content: "Sample content for pages 413\u2013440",
					},
				],
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
				bookPages: 32,
				type: "book",
				firstPage: 441,
				lastPage: 472,
				fragments: [
					{
						id: "f5478607-c034-49a0-a7ff-ef82d595472e",
						type: "text",
						content: "Sample content for pages 441\u2013472",
					},
				],
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
				bookPages: 2,
				type: "book",
				firstPage: 473,
				lastPage: 474,
				fragments: [
					{
						id: "974ff540-8457-469d-b785-34bb5eb69165",
						type: "text",
						content: "Sample content for pages 473\u2013474",
					},
				],
			},
		],
	},
	{
		id: "74902349-6d46-46e6-9049-7651a0a752fe",
		title: "Appendix A: Spren Types",
		type: "appendix",
		pages: [
			{
				id: "cd5a6e68-ba52-4b12-9788-74aaf83c76f2",
				bookPages: 4,
				type: "book",
				firstPage: 475,
				lastPage: 478,
				fragments: [
					{
						id: "c7df3184-a1df-4d3a-a1c2-68227e62b22b",
						type: "text",
						content: "Sample content for pages 475\u2013478",
					},
				],
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
				bookPages: 6,
				type: "book",
				firstPage: 479,
				lastPage: 484,
				fragments: [
					{
						id: "521bd97a-1deb-45c1-b233-69c3eac6adc4",
						type: "text",
						content: "Sample content for pages 479\u2013484",
					},
				],
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
				bookPages: 1,
				type: "book",
				firstPage: 485,
				lastPage: 485,
				fragments: [
					{
						id: "b8bfe448-2824-49d7-807c-2ac436fc57d9",
						type: "text",
						content: "Sample content for pages 485\u2013485",
					},
				],
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
				bookPages: 2,
				type: "book",
				firstPage: 486,
				lastPage: 487,
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
];

export const bookData: Book = {
	id: 0,
	title: "The Way of Kings",
	authorId: 1,
	description:
		"An epic fantasy novel by Brandon Sanderson, first in the Stormlight Archive.",
	coverImageUrl: "https://example.com/images/way-of-kings.jpg",
	type: "official",
	userId: "user-123",
	status: "published", // assuming BookStatus is something like "draft" | "published"
	createdAt: new Date("2020-03-04T12:00:00Z"),
	updatedAt: new Date("2021-07-10T15:30:00Z"),
};
export type Fragment = {
	id: string;
	type: "text" | "image"; // extend if needed
	content: string;
};

export type Page = {
	id: string;
	type: PageType;
	bookPages: number;
	firstPage: number;
	lastPage: number;
	fragments: Fragment[];
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

export type PageType = "book" | "comic";

export type BookEntry = {
	id: string;
	title: string;
	type: EntryType;
	pages: Page[];
};
