import { outputMinioClient } from '../../lib/file-managment';
import { NextRequest, NextResponse } from 'next/server';

const bucketName = 'output';
const expiry = 60 * 60; // Default to 1 hour if expiry is not provided

export async function POST(req: NextRequest) {
  try {
    const filePath = await req.json(); // expect filePath and expiry in the request body
    if (!filePath) {
      return NextResponse.json(
        { error: 'Missing filePath in request body' },
        { status: 400 }
      );
    }
    // strip file path to only contain key
    const sanfilePath = filePath.replace(/^https?:\/\/[^]+\/output\//, '');

    // generate the presigned URL
    const presignedUrl = await outputMinioClient.presignedUrl(
      'GET', // HTTP method
      bucketName,
      sanfilePath,
      expiry
    );

    return NextResponse.json({ presignedUrl });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}
