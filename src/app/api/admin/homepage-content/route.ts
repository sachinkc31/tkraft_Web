import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/constants";

// Helper to construct WP REST API auth headers
function getWpAuthHeaders() {
  const wpUser = process.env.WP_ADMIN_USERNAME?.trim().replace(/^["']|["']$/g, "");
  const wpAppPass = process.env.WP_APPLICATION_PASSWORD?.trim().replace(/^["']|["']$/g, "");

  if (wpUser && wpAppPass) {
    // Strip all spaces from the application password as WordPress strips spaces before hashing/verifying
    const cleanAppPass = wpAppPass.replace(/\s+/g, "");
    const encoded = Buffer.from(`${wpUser}:${cleanAppPass}`).toString("base64");
    return {
      Authorization: `Basic ${encoded}`,
      "Content-Type": "application/json",
    };
  }

  const key = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
  const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";
  const encoded = Buffer.from(`${key}:${secret}`).toString("base64");
  return {
    Authorization: `Basic ${encoded}`,
    "Content-Type": "application/json",
  };
}

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate Request
    const authHeader = request.headers.get("Authorization") || "";
    const passkey = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    const expectedPasskey = process.env.ADMIN_PASSKEY || "tkraft_admin_secure_passkey_2026";

    console.log("[API/admin/homepage-content] GET received passkey:", passkey);
    console.log("[API/admin/homepage-content] GET expected passkey:", expectedPasskey);

    if (passkey !== expectedPasskey) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Fetch Homepage Content from WordPress Page ID 6144 publicly (no authorization header needed for GET)
    const wpUrl = `${API_CONFIG.wpRestUrl}/pages/6144`;
    const res = await fetch(wpUrl, {
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `WordPress API returned status ${res.status}` },
        { status: res.status }
      );
    }

    const page = await res.json();
    return NextResponse.json({
      id: page.id,
      slug: page.slug,
      title: page.title?.rendered,
      acf: page.acf || {},
    });
  } catch (error: any) {
    console.error("[API/admin/homepage-content] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch homepage content: " + (error.message || "") },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate Request
    const authHeader = request.headers.get("Authorization") || "";
    const passkey = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
    const expectedPasskey = process.env.ADMIN_PASSKEY || "tkraft_admin_secure_passkey_2026";

    console.log("[API/admin/homepage-content] POST received passkey:", passkey);
    console.log("[API/admin/homepage-content] POST expected passkey:", expectedPasskey);

    if (passkey !== expectedPasskey) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Parse payload and sanitize media objects (reducing them to integer IDs)
    const body = await request.json();
    let acfUpdates = body.acf;

    if (!acfUpdates || typeof acfUpdates !== "object") {
      return NextResponse.json(
        { error: "Invalid payload: 'acf' object is required" },
        { status: 400 }
      );
    }

    // Sanitize ACF inputs (WordPress rejects full image/file objects, expects integer ID or null)
    const sanitized: any = {};
    for (const [key, value] of Object.entries(acfUpdates)) {
      // 1. Convert empty repeater fields (like grid_items) to an empty array [] to satisfy array validations
      if (
        (key === "grid_items" || key.includes("items")) && 
        (value === false || value === "" || value === null || value === undefined)
      ) {
        sanitized[key] = [];
        continue;
      }

      // 2. Convert boolean false or empty strings to null for image/media fields to satisfy WordPress REST API schemas
      if (
        (key.includes("image") || key.includes("banner") || key.includes("logo") || key.includes("icon")) && 
        (value === false || value === "")
      ) {
        sanitized[key] = null;
        continue;
      }

      // 2. Resolve empty icon picker objects (e.g., { type: "", value: "" }) to prevent enum errors
      if (
        key.includes("icon") && 
        value && 
        typeof value === "object" && 
        !Array.isArray(value) && 
        ((value as any).value === "" || !(value as any).type)
      ) {
        sanitized[key] = {
          type: "dashicons",
          value: ""
        };
        continue;
      }

      // 3. Resolve media objects
      if (value && typeof value === "object" && !Array.isArray(value)) {
        const anyVal = value as any;
        const possibleId = anyVal.id !== undefined ? anyVal.id : anyVal.ID;
        if (possibleId !== undefined && possibleId !== null && possibleId !== "") {
          const numId = Number(possibleId);
          if (!isNaN(numId)) {
            sanitized[key] = numId;
            continue;
          }
        }
      }

      // 4. Convert primitive arrays (like category slugs/IDs) to comma-separated strings if the API expects a string/null type.
      // Do NOT convert repeater arrays or arrays of objects (like grid_items)
      if (Array.isArray(value)) {
        const isArrayOfObjects = value.length > 0 && typeof value[0] === "object" && value[0] !== null;
        if (isArrayOfObjects || key === "grid_items" || key.includes("items")) {
          sanitized[key] = value;
        } else {
          sanitized[key] = value.join(",");
        }
        continue;
      }

      sanitized[key] = value;
    }
    acfUpdates = sanitized;

    // 3. Update Homepage Page (ID 6144) in WordPress
    const wpUser = process.env.WP_ADMIN_USERNAME?.trim().replace(/^["']|["']$/g, "");
    const wpAppPass = process.env.WP_APPLICATION_PASSWORD?.trim().replace(/^["']|["']$/g, "");
    
    let wpUrl = "";
    if (wpUser && wpAppPass) {
      // If full WordPress user application credentials are provided, write directly to WordPress core page
      wpUrl = `${API_CONFIG.wpRestUrl}/pages/6144`;
    } else {
      // Fallback: Write via custom theme REST endpoint (requires the theme custom route to be active on WP host)
      const key = process.env.WOOCOMMERCE_CONSUMER_KEY || "";
      const secret = process.env.WOOCOMMERCE_CONSUMER_SECRET || "";
      wpUrl = `${API_CONFIG.wpRestUrl.replace("/wp-json/wp/v2", "/wp-json/tkraft/v1")}/homepage-content?consumer_key=${key}&consumer_secret=${secret}`;
    }

    const wpRes = await fetch(wpUrl, {
      method: "POST",
      headers: getWpAuthHeaders(),
      body: JSON.stringify({
        acf: acfUpdates,
      }),
    });

    if (!wpRes.ok) {
      const errorText = await wpRes.text();
      console.error("[API/admin/homepage-content] WordPress Update Error:", errorText);
      let wpErrorObj = null;
      try { wpErrorObj = JSON.parse(errorText); } catch(e) {}
      return NextResponse.json(
        { 
          error: `WordPress failed to update: ${wpRes.statusText}`,
          wpError: wpErrorObj,
          debugGridItems: {
            value: acfUpdates.grid_items,
            type: typeof acfUpdates.grid_items,
            isArray: Array.isArray(acfUpdates.grid_items),
            rawPayloadVal: sanitized.grid_items
          }
        },
        { status: wpRes.status }
      );
    }

    const updatedPage = await wpRes.json();
    return NextResponse.json({
      success: true,
      acf: updatedPage.acf || {},
    });
  } catch (error: any) {
    console.error("[API/admin/homepage-content] POST Error:", error);
    return NextResponse.json(
      { error: "Failed to update homepage content: " + (error.message || "") },
      { status: 500 }
    );
  }
}
