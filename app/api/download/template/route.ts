import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

// Use environment variables for Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const TEMPLATE_MAP: Record<string, string> = {
  nda: 'NDA_Template.docx',
  contract: 'Contract_Template.docx',
  partnership: 'Partnership_Template.docx',
};

export async function GET(request: NextRequest) {
  // Check for user session (JWT in cookie or Authorization header)
  const { searchParams } = new URL(request.url);
  const template = searchParams.get('template');
  const cookieToken = request.cookies.get('sb-access-token')?.value;
  const headerToken = request.headers.get('authorization')?.replace('Bearer ', '');
  const token = cookieToken || headerToken;

  if (!token) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  // Validate session with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
  }

  if (!template || !(template in TEMPLATE_MAP)) {
    return NextResponse.json({ error: 'Invalid template requested' }, { status: 400 });
  }

  // Serve the file from public directory
  const filePath = path.join(process.cwd(), 'public', TEMPLATE_MAP[template]);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }
  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${TEMPLATE_MAP[template]}"`,
      'Content-Length': fileBuffer.length.toString(),
    },
  });
} 