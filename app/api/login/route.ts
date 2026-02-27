import { NextResponse } from 'next/server';
import { appendToLog } from '@/lib/logger';

export async function POST() {
  await appendToLog('API route /api/login hit.');
  const response = NextResponse.json({ success: true });
  response.cookies.set('auth', 'true', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 86400, // 1 day
    partitioned: true,
  });
  await appendToLog('Authentication cookie set.');
  return response;
}
