// Server only. Mints the short-lived JWT that PostgREST uses to apply RLS.
import { SignJWT } from 'jose';

const secret = () => new TextEncoder().encode(process.env.PGRST_JWT_SECRET);

export async function signDbToken(user: { id: string; email: string }) {
  const expiresAt = Date.now() + 15 * 60 * 1000;
  const token = await new SignJWT({ role: 'authenticated', email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt / 1000))
    .sign(secret());
  return { token, expiresAt };
}
