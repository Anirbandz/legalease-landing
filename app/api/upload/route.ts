import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'User authentication required' }, { status: 401 });
    }

    // Check file type
    if (!file.type.includes('pdf')) {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Convert file to text (using sample text for now)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Use sample text for now (we'll implement real PDF parsing later)
    const documentText = `This is a sample legal document analysis. The document contains various clauses and terms that need to be reviewed. 
    
    Key sections include:
    1. Parties involved in the agreement
    2. Terms and conditions
    3. Payment schedules
    4. Termination clauses
    5. Confidentiality provisions
    
    The document appears to be a standard business contract with typical legal language and structure.`;
    
    // Store file in Supabase storage (optional - skip if bucket doesn't exist)
    let fileUrl = null;
    try {
      const fileName = `${userId}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        // Continue without storage - just use the parsed text
      } else {
        fileUrl = uploadData.path;
      }
    } catch (storageError) {
      console.error('Storage error:', storageError);
      // Continue without storage
    }

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileUrl: fileUrl,
      documentText: documentText
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 