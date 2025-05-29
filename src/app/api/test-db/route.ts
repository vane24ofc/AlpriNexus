// src/app/api/test-db/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  console.log('API /api/test-db PINGED!'); // Add a log to check server-side
  return NextResponse.json({ message: 'AlpriNexus API test-db route reached successfully!' });
}
