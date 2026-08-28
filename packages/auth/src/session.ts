import { SignJWT, jwtVerify } from "jose";

export interface SessionClaims {
  sub: string; // userId
  sid: string; // Session.id in the db, so it can be revoked server-side
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set a 32+ byte random value (see .env.example)."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function issueSessionToken(claims: SessionClaims, expiresInSeconds = 60 * 60 * 24 * 30) {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionClaims> {
  const { payload } = await jwtVerify(token, getSecret());
  if (typeof payload.sub !== "string" || typeof payload.sid !== "string") {
    throw new Error("Malformed session token");
  }
  return { sub: payload.sub, sid: payload.sid };
}
