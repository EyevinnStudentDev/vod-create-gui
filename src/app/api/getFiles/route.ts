import { NextResponse } from 'next/server';
import { minioClient } from '../../lib/file-managment';
import { NextApiRequest, NextApiResponse } from 'next';
import { Client } from 'minio';

export async function GET() {
  try {
    // fetch all buckets
    const buckets = await minioClient.listBuckets();
    console.log('buckets in input: ', buckets);

    const allFiles: any[] = [];
    for (const bucket of buckets) {
      const bucketName = bucket.name;
      const files: any[] = [];

      // fetch all files in all subfolders/buckets
      const stream = minioClient.listObjectsV2(bucketName, '', true);
      await new Promise<void>((resolve, reject) => {
        stream.on('data', (obj) => {
          files.push({
            bucket: bucketName,
            key: obj.name,
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
