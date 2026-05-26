import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get("pincode");

  if (!pincode) {
    return NextResponse.json({ error: "Pincode query parameter is required" }, { status: 400 });
  }

  const trimmed = pincode.trim().toUpperCase();
  const isIndianPincode = /^[1-9][0-9]{5}$/.test(trimmed);

  if (!isIndianPincode) {
    // If not Indian, return standard fallback message (or check international courier)
    return NextResponse.json({
      serviceable: true,
      message: "✅ Delivery available! Expected in 5-10 business days.",
      estimated_delivery_days: 7,
      etd: null
    });
  }

  try {
    const email = process.env.SHIPROCKET_EMAIL;
    const password = process.env.SHIPROCKET_PASSWORD;

    if (!email || !password) {
      console.warn("Shiprocket credentials are not configured in environment variables.");
      // Fallback
      return NextResponse.json({
        serviceable: true,
        message: "✅ Delivery available! Expected in 3-5 business days.",
        estimated_delivery_days: 4,
        etd: null
      });
    }

    // Step 1: Login to Shiprocket
    const loginRes = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      // cache token for 1 hour to prevent rate limiting
      next: { revalidate: 3600 } 
    });

    if (!loginRes.ok) {
      const errData = await loginRes.json().catch(() => ({}));
      throw new Error(errData.message || "Shiprocket auth failed");
    }

    const loginData = await loginRes.json();
    const token = loginData.token;

    if (!token) {
      throw new Error("Shiprocket auth token is missing");
    }

    // Step 2: Check serviceability
    // Warehouse postcode defaults to 560001 (Bengaluru hub)
    const pickupPostcode = process.env.SHIPROCKET_PICKUP_PINCODE || "560001";
    const serviceabilityUrl = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${pickupPostcode}&delivery_postcode=${trimmed}&weight=0.5&cod=1`;

    const serviceabilityRes = await fetch(serviceabilityUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!serviceabilityRes.ok) {
      const errData = await serviceabilityRes.json().catch(() => ({}));
      throw new Error(errData.message || "Shiprocket serviceability query failed");
    }

    const result = await serviceabilityRes.json();
    
    if (result.status === 200 && result.data && result.data.available_courier_companies) {
      const couriers = result.data.available_courier_companies;
      
      if (Array.isArray(couriers) && couriers.length > 0) {
        // Filter out couriers with valid etd or estimated_delivery_days
        const validCouriers = couriers.filter(c => c.etd || c.estimated_delivery_days);
        
        if (validCouriers.length > 0) {
          // Find the courier with the earliest delivery days
          const bestCourier = validCouriers.reduce((prev, curr) => {
            const prevDays = parseInt(prev.estimated_delivery_days) || 999;
            const currDays = parseInt(curr.estimated_delivery_days) || 999;
            return currDays < prevDays ? curr : prev;
          });

          const days = parseInt(bestCourier.estimated_delivery_days);
          const etd = bestCourier.etd;
          
          let message = "";
          if (days) {
            const dayLabel = days === 1 ? "day" : "days";
            message = `✅ Delivery available! Expected in ${days} business ${dayLabel}.`;
          } else if (etd) {
            try {
              const date = new Date(etd);
              const formattedDate = date.toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
              });
              message = `✅ Delivery available! Expected by ${formattedDate}.`;
            } catch {
              message = `✅ Delivery available! Expected by ${etd}.`;
            }
          } else {
            message = "✅ Delivery available! Expected in 2-4 business days.";
          }

          return NextResponse.json({
            serviceable: true,
            message,
            estimated_delivery_days: days || null,
            etd: etd || null,
            courier_name: bestCourier.courier_name || null
          });
        }
      }
    }

    // If not serviceable or no couriers
    return NextResponse.json({
      serviceable: false,
      message: "❌ Delivery not serviceable for this pincode.",
      estimated_delivery_days: null,
      etd: null
    });

  } catch (error: any) {
    console.error("[Shiprocket API Router] Error:", error);
    // Fallback response so it never fails
    return NextResponse.json({
      serviceable: true,
      message: "✅ Delivery available! Expected in 3-5 business days.",
      estimated_delivery_days: 4,
      etd: null,
      fallback: true
    });
  }
}
