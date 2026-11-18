import { SignJWT } from 'jose';

export async function mintDbToken(user: { id: string; email: string }) {
  return new SignJWT({ role: 'authenticated', email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(new TextEncoder().encode(process.env.POSTGREST_JWT_SECRET));
}