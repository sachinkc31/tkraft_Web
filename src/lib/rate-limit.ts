import { NextRequest } from "next/server";

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const cache = new Map<string, RateLimitInfo>();

// Clean up expired cache entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now > value.resetTime) {
        cache.delete(key);
      }
    }
  }, 1000 * 60 * 5);
}

/**
 * Checks client request rate limit.
 * @param request NextRequest context
 * @param limit Maximum allowed hits in the time frame
 * @param windowMs Time frame duration in milliseconds (default 1 minute)
 * @returns Rate limit status details
 */
export function rateLimit(
  request: NextRequest,
  limit: number = 5,
  windowMs: number = 60000
) {
  // Resolve client IP (taking proxy headers like Nginx/Cloudflare into account)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
             request.headers.get("x-real-ip") || 
             "127.0.0.1";

  const path = new URL(request.url).pathname;
  const key = `${path}:${ip}`;

  const now = Date.now();
  const cachedData = cache.get(key);

  if (!cachedData) {
    const info = { count: 1, resetTime: now + windowMs };
    cache.set(key, info);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: info.resetTime,
    };
  }

  // If window expired, reset counts
  if (now > cachedData.resetTime) {
    cachedData.count = 1;
    cachedData.resetTime = now + windowMs;
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: cachedData.resetTime,
    };
  }

  cachedData.count += 1;

  if (cachedData.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: cachedData.resetTime,
    };
  }

  return {
    success: true,
    limit,
    remaining: limit - cachedData.count,
    reset: cachedData.resetTime,
  };
}
