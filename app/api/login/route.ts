import { NextResponse } from 'next/server';
import { appendToLog } from '@/lib/logger';

export async function POST() {
  await appendToLog('API route /api/login hit.');
  const response = NextResponse.json({ success: true });
  response.cookies.set('auth', 'true', {
    httpOnly: true,
    path: '/',
    maxAge: 86400, // 1 day
    // Rimuoviamo secure: true e sameSite: 'none' per compatibilità con HTTP locale
    // In produzione con HTTPS questi andrebbero riattivati o gestiti dinamicamente
  });
  await appendToLog('Authentication cookie set.');
  return response;
}
