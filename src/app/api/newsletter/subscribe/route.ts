import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Simple file-based storage for now, before migrating fully to WP/Mailchimp sync
const SUBSCRIBERS_FILE = path.join(process.cwd(), "subscribers.json");

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    let subscribers: string[] = [];
    try {
      const fileData = await fs.readFile(SUBSCRIBERS_FILE, "utf-8");
      subscribers = JSON.parse(fileData);
    } catch (err) {
      // File doesn't exist, start fresh
    }

    if (subscribers.includes(email.toLowerCase())) {
      return NextResponse.json({ error: "Email is already subscribed" }, { status: 400 });
    }

    subscribers.push(email.toLowerCase());
    await fs.writeFile(SUBSCRIBERS_FILE, JSON.stringify(subscribers, null, 2));

    // TODO: Forward this email to WordPress/Mailchimp integration via REST API
    // e.g. fetch('https://tkraft.in/wp-json/mailchimp/v1/subscribe', { ... })

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Newsletter Subscribe Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
