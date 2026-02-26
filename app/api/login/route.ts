import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('auth', 'true', {
    httpOnly: true,
    path: '/',
    maxAge: 86400, // 1 day
  });
  return response;
}
