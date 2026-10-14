import { env } from "cloudflare:workers";
import { headers } from "next/headers";

/**
 * Fail-closed Cloudflare Access authentication for the survey administrators.
 * Never trust a client-supplied email header without verifying the Access JWT.
 */
export async function getAuthorizedAdminEmail(): Promise<string | null> {
  const config = env as unknown as Record<string, string | undefined>;
  const teamDomain = config.CF_ACCESS_TEAM_DOMAIN?.trim().replace(/\/$/, "");
  const audience = config.CF_ACCESS_AUD?.trim();
  const allowed = new Set(
    (config.SURVEY_ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );

  if (!teamDomain || !audience || allowed.size === 0) return null;
  if (!/^https:\/\/[a-z0-9-]+\.cloudflareaccess\.com$/i.test(teamDomain)) return null;

  const requestHeaders = await headers();
  const jwt = requestHeaders.get("cf-access-jwt-assertion");
  if (!jwt) return null;

  try {
    const parts = jwt.split(".");
    if (parts.length !== 3) return null;

    const header = decodeJSON(parts[0]) as { alg?: string; kid?: string };
    const payload = decodeJSON(parts[1]) as {
      iss?: string;
      aud?: string[];
      exp?: number;
      nbf?: number;
      email?: string;
    };

    const now = Math.floor(Date.now() / 1000);
    if (
      header.alg !== "RS256" ||
      !header.kid ||
      payload.iss !== teamDomain ||
      !Array.isArray(payload.aud) ||
      !payload.aud.includes(audience) ||
      typeof payload.exp !== "number" ||
      payload.exp <= now ||
      (typeof payload.nbf === "number" && payload.nbf > now) ||
      typeof payload.email !== "string"
    ) return null;

    const email = payload.email.trim().toLowerCase();
    if (!allowed.has(email)) return null;

    const response = await fetch(`${teamDomain}/cdn-cgi/access/certs`, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;

    const certs = (await response.json()) as {
      keys?: Array<JsonWebKey & { kid?: string }>;
    };
    const jwk = certs.keys?.find((key) => key.kid === header.kid && key.kty === "RSA");
    if (!jwk) return null;

    const key = await crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const message = new TextEncoder().encode(`${parts[0]}.${parts[1]}`);
    const signature = base64urlBytes(parts[2]);
    const verified = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", key, signature, message);
    return verified ? email : null;
  } catch {
    return null;
  }
}

function base64urlBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const bytes = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
  return Uint8Array.from(bytes, (char) => char.charCodeAt(0));
}

function decodeJSON(value: string): unknown {
  return JSON.parse(new TextDecoder().decode(base64urlBytes(value)));
}
