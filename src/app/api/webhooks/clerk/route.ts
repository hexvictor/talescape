import { Webhook } from "svix";
import type { NextRequest } from "next/server";
import { addUser } from "~/server/db/queries/users/addUser";
import { addUserEmails } from "~/server/db/queries/users/addUserEmails";
import { updateUser } from "~/server/db/queries/users/updateUser";
import { updateUserEmails } from "~/server/db/queries/users/updateUserEmails";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  if (!process.env.CLERK_WEBHOOK_SECRET) {
    console.error("Missing Clerk webhook secret");
    return new Response("Server misconfigured", { status: 500 });
  }

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

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
    const {
      id,
      username,
      image_url,
      first_name,
      last_name,
      email_addresses,
      primary_email_address_id,
    } = eventData;

    await addUser({
      id,
      username,
      imageUrl: image_url,
      firstName: first_name ?? "",
      lastName: last_name ?? "",
      fullName: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      primaryEmailId: primary_email_address_id,
      emailVerifiedAt: new Date(),
    });

    // biome-ignore lint/suspicious/noExplicitAny: webhook type is dynamic
    const emails = email_addresses.map((email: any) => ({
      id: email.id,
      userId: id,
      email: email.email_address,
    }));

    await addUserEmails(emails);
  }
  if (eventType === "user.updated") {
    const {
      id,
      username,
      image_url,
      first_name,
      last_name,
      email_addresses,
      primary_email_address_id,
      emailVerifiedAt,
    } = eventData;

    await updateUser({
      id,
      username,
      imageUrl: image_url,
      firstName: first_name ?? "",
      lastName: last_name ?? "",
      fullName: `${first_name ?? ""} ${last_name ?? ""}`.trim(),
      primaryEmailId: primary_email_address_id,
      emailVerifiedAt,
    });

    // biome-ignore lint/suspicious/noExplicitAny: webhook type is dynamic
    const emails = email_addresses.map((email: any) => ({
      id: email.id,
      userId: id,
      email: email.email_address,
    }));

    await updateUserEmails(emails);
  }

  return new Response("OK", { status: 200 });
}
