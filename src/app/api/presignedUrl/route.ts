import {
  createPresignedUrlToUpload,
  minioClient
} from '../../lib/file-managment';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';
import { FileUploadRequest, PresignedUrlResponse } from '../../lib/types';

const bucketName = process.env.AWS_TENANT_BUCKET || '';
const expiry = 60 * 60; // 24 hours

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  // parse request body as JSON
  const body = await req.json();

  const files = body as FileUploadRequest[];

  if (!files?.length) {
    return NextResponse.json({ message: 'No files to upload' });
  }

  // check if bucket exists
  const bucketExists = await minioClient.bucketExists(bucketName);
  if (!bucketExists) {
    console.log(`Bucket "${bucketName}" does not exist. Creating it...`);
    await minioClient.makeBucket(bucketName);
    console.log(`Bucket "${bucketName}" created successfully.`);
  }

  const presignedUrls: PresignedUrlResponse[] = [];

  if (files?.length) {
    // use Promise.all to get all the presigned URLs in parallel
    await Promise.all(
      // loop through the files
      files.map(async (file) => {
        const fileName = `${nanoid(5)}-${file?.originalFileName}`;

        // get presigned URL using s3/minio SDK
        const url = await createPresignedUrlToUpload({
          bucketName,
          fileName,
          expiry
        });

        // add presigned URL to the list
        presignedUrls.push({
          fileNameInBucket: fileName,
          originalFileName: file.originalFileName,
          fileSize: file.fileSize,
          url
        });
      })
    );
  }

  return NextResponse.json(presignedUrls);
}
