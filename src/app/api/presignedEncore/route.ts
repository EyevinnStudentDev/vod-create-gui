import { minioClient } from '../../lib/file-managment';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

const bucketName = 'input';

export async function POST(req: NextRequest) {
  try {
    const files = await req.json(); // parsing

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: 'Request body must contain an array of files' },
        { status: 400 }
      );
    }

    const presignedUrls = await Promise.all(
      files.map(async (file) => {
        const { fileNameInBucket } = file;

        if (!fileNameInBucket) {
          throw new Error('Missing fileNameInBucket in one of the files');
        }

        // generate a presigned URL for each file
        const url = await minioClient.presignedUrl(
          'GET',
          bucketName,
          fileNameInBucket,
          60 * 60 // 1-hour expiry
        );

        return {
          fileNameInBucket,
          url
        };
      })
    );

    return NextResponse.json(presignedUrls);
  } catch (error) {
    console.error('Error generating presigned URLs:', error);
    return NextResponse.json(
      { error: 'Failed to generate presigned URLs' },
      { status: 500 }
    );
  }
}
