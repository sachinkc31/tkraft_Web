import fs from 'fs';

const key = "ck_90b1028b7db06d527c287143b4084077e5f5122d";
const secret = "cs_1a61d6387ff6ab172ad9fcfdfea23ed742803bd7";
const encoded = Buffer.from(`${key}:${secret}`).toString("base64");

async function checkLayout() {
  const url = 'https://tkraft.online/wp-json/wp/v2/pages?slug=homepage-layout';
  console.log(`Fetching ${url}...`);
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${encoded}`,
        "Content-Type": "application/json",
      }
    });
    if (!res.ok) {
      console.error(`HTTP error: ${res.status} ${res.statusText}`);
      return;
    }
    const data = await res.json();
    console.log("Response length:", data.length);
    if (data.length > 0) {
      const page = data[0];
      console.log("Page found! Title:", page.title?.rendered);
      console.log("Rendered content:", page.content?.rendered);
    } else {
      console.log("Page not found (length is 0)");
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

checkLayout();
