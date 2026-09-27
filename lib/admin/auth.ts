import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Sessão do editor: cookie HttpOnly com "expiração.assinatura" (HMAC-SHA256).
// Nada de senha ou token vai para o navegador.

export const SESSION_COOKIE = "admin_session";
/** Cookie legível pelo navegador só para saber se vale mostrar a barra do editor. Não dá acesso a nada. */
export const HINT_COOKIE = "admin_hint";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 horas

const sha256 = (v: string) => createHash("sha256").update(v).digest();

const MIN_PASSWORD = 12;

function password() {
  const p = process.env.ADMIN_PASSWORD;
  return p && p.length >= MIN_PASSWORD ? p : null;
}

/**
 * Chave que assina a sessão. Usa SESSION_SECRET se existir; senão deriva da senha,
 * então trocar a senha na Vercel derruba todas as sessões abertas.
 */
function secret() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return s;
  const p = password();
  return p ? createHash("sha256").update(`portfolio-admin-session:${p}`).digest("hex") : null;
}

export function adminConfigured() {
  return Boolean(password());
}

/** Compara em tempo constante para não vazar a senha por tempo de resposta. */
export function checkPassword(input: string) {
  const expected = password();
  if (!expected || !input) return false;
  return timingSafeEqual(sha256(input), sha256(expected));
}

const sign = (payload: string, key: string) => createHmac("sha256", key).update(payload).digest("base64url");

export function createSession() {
  const key = secret();
  if (!key) throw new Error("ADMIN_PASSWORD ausente ou curta demais");
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE);
  return `${exp}.${sign(exp, key)}`;
}

export function verifySession(token: string | undefined) {
  const key = secret();
  if (!key || !token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  const expected = Buffer.from(sign(exp, key));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  return Number(exp) > Date.now() / 1000;
}

export function cookieOptions(maxAge: number, httpOnly = true) {
  return {
    httpOnly,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  };
}

/** Bloqueia requisições de outros sites (CSRF): a origem precisa ser o próprio site. */
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

// Limite simples de tentativas de login por IP (por instância do servidor).
const attempts = new Map<string, { count: number; until: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

export function loginBlocked(ip: string) {
  const a = attempts.get(ip);
  return Boolean(a && a.count >= MAX_ATTEMPTS && a.until > Date.now());
}

export function registerFailure(ip: string) {
  const now = Date.now();
  const a = attempts.get(ip);
  if (!a || a.until < now) attempts.set(ip, { count: 1, until: now + WINDOW_MS });
  else a.count += 1;
}

export function clearFailures(ip: string) {
  attempts.delete(ip);
}

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}
