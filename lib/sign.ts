import crypto from "crypto";

const secret = process.env.APP_SECRET!;
function b64u(s: Buffer | string) {
  return Buffer.from(s).toString("base64url");
}
export function signToken(payload: any, ttlSeconds: number) {
  const header = { alg: "HS256", typ: "JWT", exp: Math.floor(Date.now()/1000) + ttlSeconds };
  const encHeader = b64u(JSON.stringify(header));
  const encPayload = b64u(JSON.stringify(payload));
  const data = `${encHeader}.${encPayload}`;
  const sig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}
export function verifyToken(token: string) {
  const [h, p, s] = token.split(".");
  if (!h || !p || !s) return null;
  const check = crypto.createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url");
  if (check !== s) return null;
  const header = JSON.parse(Buffer.from(h, "base64url").toString());
  if (header.exp && header.exp < Math.floor(Date.now()/1000)) return null;
  return JSON.parse(Buffer.from(p, "base64url").toString());
}
