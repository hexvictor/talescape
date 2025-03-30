import { Webhook } from "svix";
import type { NextRequest } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";

export async function POST(req: NextRequest) {
	const payload = await req.text();
	const headers = Object.fromEntries(req.headers.entries());

	const isDev = process.env.NODE_ENV === "development";

	console.log(isDev);
	const secret = isDev
		? process.env.CLERK_WEBHOOK_SECRET_DEV
		: process.env.CLERK_WEBHOOK_SECRET_PROD;

	if (!secret) {
		console.error("Missing Clerk webhook secret");
		return new Response("Server misconfigured", { status: 500 });
	}

	const wh = new Webhook(secret);

	// biome-ignore lint/suspicious/noExplicitAny: webhook type is dynamic
	let evt: any;

	try {
		evt = wh.verify(payload, headers);
	} catch (err) {
		return new Response("Invalid webhook signature", { status: 400 });
	}

	const eventType = evt.type;
	const eventData = evt.data;

	if (eventType === "user.created") {
		const { id, email_addresses, username, image_url, first_name, last_name } =
			eventData;

		// id: d.varchar({ length: 255 }).notNull().primaryKey(), // Clerk user ID
		// username: d.varchar({ length: 255 }),
		// firstName: d.varchar({ length: 255 }),
		// lastName: d.varchar({ length: 255 }),
		// name: d.varchar({ length: 255 }),
		// email: d.varchar({ length: 255 }).notNull(),
		// emailVerified: d.timestamp({ withTimezone: true }),
		// image: d.varchar({ length: 1024 }),

		await db.insert(users).values({
			id,
			email: email_addresses[0]?.email_address ?? "",
			username: username,
			name: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
			firstName: `${first_name ?? ""}}`.trim(),
			lastName: `${last_name ?? ""}`.trim(),
			image: image_url,
			emailVerified: new Date(),
		});
	}

	return new Response("OK", { status: 200 });
}
