const key = "ck_90b1028b7db06d527c287143b4084077e5f5122d";
const secret = "cs_1a61d6387ff6ab172ad9fcfdfea23ed742803bd7";
const encoded = Buffer.from(`${key}:${secret}`).toString("base64");
import fs from 'fs';

async function checkSCF() {
  const url = 'https://tkraft.in/wp-json/wp/v2/pages?slug=homepage-content';
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
      const text = await res.text();
      console.error(text);
      return;
    }
    const data = await res.json();
    fs.writeFileSync('C:/Users/Shalom/.gemini/antigravity/brain/d4dde738-dc36-4489-985b-74ab3412b173/scf_response.json', JSON.stringify(data, null, 2));
    console.log("Wrote full response to scf_response.json");
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

checkSCF();
