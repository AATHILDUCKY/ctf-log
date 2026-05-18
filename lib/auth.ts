import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const DEFAULT_COOKIE_NAME = 'secwriteups_admin_token';
const DEFAULT_EXPIRES_IN_SECONDS = 60 * 60 * 8;

function authSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }
  return new TextEncoder().encode(secret);
}

export function authCookieName() {
  return process.env.ADMIN_AUTH_COOKIE_NAME ?? DEFAULT_COOKIE_NAME;
}

export function authExpiresInSeconds() {
  const raw = Number(process.env.ADMIN_JWT_EXPIRES_IN_SECONDS ?? DEFAULT_EXPIRES_IN_SECONDS);
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_EXPIRES_IN_SECONDS;
  return Math.floor(raw);
}

export async function signAdminToken(username: string) {
  return new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${authExpiresInSeconds()}s`)
    .sign(authSecret());
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, authSecret(), { algorithms: ['HS256'] });
    return payload.role === 'admin';
  } catch {
    return false;
  }
}

export async function isAdminRequest(request: NextRequest) {
  const token = request.cookies.get(authCookieName())?.value;
  if (!token) return false;
  return verifyAdminToken(token);
}

export function verifyAdminCredentials(username: string, password: string) {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) return false;
  return username === expectedUser && password === expectedPass;
}
