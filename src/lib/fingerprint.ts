import { createHash } from "crypto";
import { headers } from "next/headers";

/**
 * Generates a unique fingerprint for the current visitor based on
 * their IP address and User-Agent. The fingerprint is hashed using
 * SHA-256 to anonymize the data before storage.
 * 
 * This approach handles common proxy scenarios (Cloudflare, Vercel, nginx)
 * by checking various forwarding headers in priority order.
 */
export async function generateFingerprint(): Promise<string> {
  const headersList = await headers();
  
  // Extract IP address (handle proxies)
  const ip = getClientIp(headersList);
  
  // Extract User-Agent
  const userAgent = headersList.get("user-agent") ?? "unknown";
  
  // Combine IP + User-Agent
  const rawFingerprint = `${ip}:${userAgent}`;
  
  // Hash with SHA-256 for anonymization
  const hash = createHash("sha256")
    .update(rawFingerprint)
    .digest("hex");
  
  return hash;
}

/**
 * Extracts the real client IP address from request headers.
 * Handles various proxy scenarios by checking headers in priority order.
 * 
 * Priority:
 * 1. CF-Connecting-IP (Cloudflare)
 * 2. X-Real-IP (nginx, common proxy header)
 * 3. X-Forwarded-For (standard proxy header - takes first IP)
 * 4. Falls back to "unknown" if no IP found
 */
function getClientIp(headersList: Headers): string {
  // Cloudflare
  const cfConnectingIp = headersList.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }
  
  // X-Real-IP (nginx and other proxies)
  const xRealIp = headersList.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }
  
  // X-Forwarded-For (can contain multiple IPs: client, proxy1, proxy2...)
  // The leftmost IP is typically the original client
  const xForwardedFor = headersList.get("x-forwarded-for");
  if (xForwardedFor) {
    const ips = xForwardedFor.split(",");
    const clientIp = ips[0]?.trim();
    if (clientIp) {
      return clientIp;
    }
  }
  
  // Vercel-specific header
  const xVercelForwardedFor = headersList.get("x-vercel-forwarded-for");
  if (xVercelForwardedFor) {
    return xVercelForwardedFor.trim();
  }
  
  // Fallback
  return "unknown";
}

