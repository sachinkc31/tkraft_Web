import { NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/constants";

function getWpAuthHeaders() {
  const wpUser = process.env.WP_ADMIN_USERNAME?.trim().replace(/^["']|["']$/g, "");
  const wpAppPass = process.env.WP_APPLICATION_PASSWORD?.trim().replace(/^["']|["']$/g, "");

  if (wpUser && wpAppPass) {
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") || "1";
    const perPage = searchParams.get("per_page") || "24";
    const search = searchParams.get("search") || "";

    let url = `${API_CONFIG.wpRestUrl}/media?page=${page}&per_page=${perPage}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const res = await fetch(url, {
      headers: getWpAuthHeaders(),
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch WordPress media: ${res.statusText}` },
        { status: res.status }
      );
    }

    const mediaItems = await res.json();
    
    // Map items to a clean simplified format for picker UI
    const formatted = mediaItems.map((item: any) => ({
      id: item.id,
      title: item.title?.rendered || item.slug,
      url: item.source_url,
      mime_type: item.mime_type,
      thumbnail: item.media_details?.sizes?.thumbnail?.source_url || item.source_url,
      medium: item.media_details?.sizes?.medium?.source_url || item.source_url,
    }));

    // Pass along pagination headers from WordPress if available
    const totalItems = res.headers.get("X-WP-Total");
    const totalPages = res.headers.get("X-WP-TotalPages");

    return NextResponse.json({
      success: true,
      media: formatted,
      pagination: {
        total: totalItems ? parseInt(totalItems, 10) : formatted.length,
        pages: totalPages ? parseInt(totalPages, 10) : 1,
        currentPage: parseInt(page, 10),
      }
    });

  } catch (error: any) {
    console.error("[API/admin/media] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to load media assets: " + (error.message || "") },
      { status: 500 }
    );
  }
}
