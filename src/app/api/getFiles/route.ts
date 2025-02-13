import { NextResponse } from 'next/server';
import { minioClient } from '../../lib/file-managment';
import { FileObjectTranscode } from '../../lib/types';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // fetch all buckets
    const buckets = await minioClient.listBuckets();

    const allFiles: FileObjectTranscode[] = [];
    for (const bucket of buckets) {
      const bucketName: string = bucket.name;
      const files: FileObjectTranscode[] = [];

      // fetch all files in all subfolders/buckets
      const stream = minioClient.listObjectsV2(bucketName, '', true);
      await new Promise<void>((resolve, reject) => {
        stream.on('data', (obj) => {
          files.push({
            bucket: bucketName,
            name: obj.name,
            size: obj.size,
            lastModified: obj.lastModified
          });
        });

        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
      });

      allFiles.push(...files);
    }

    return NextResponse.json(allFiles);
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Error fetching files from storage' });
  }
}
