import { NextRequest, NextResponse } from "next/server";
import { getProductReviews, createProductReview } from "@/services/woocommerce";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const productId = parseInt(slug, 10);
    
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID parameter" }, { status: 400 });
    }

    const reviews = await getProductReviews(productId);
    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error(`[API/products/reviews/GET] Error retrieving reviews:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const productId = parseInt(slug, 10);
    
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID parameter" }, { status: 400 });
    }

    const { review, reviewer, reviewer_email, rating } = await request.json();

    if (!review || !reviewer || !reviewer_email || typeof rating !== "number") {
      return NextResponse.json(
        { error: "Missing required fields: review, reviewer, reviewer_email, and rating are required." },
        { status: 400 }
      );
    }

    const newReview = await createProductReview({
      product_id: productId,
      review,
      reviewer,
      reviewer_email,
      rating,
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error: any) {
    console.error(`[API/products/reviews/POST] Error submitting review:`, error);
    return NextResponse.json(
      { error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
