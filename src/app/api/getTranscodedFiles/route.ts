import { outputMinioClient } from '../../lib/file-managment'; // Path to your MinIO client
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // fetch all buckets
    const buckets = await outputMinioClient.listBuckets();
    console.log('buckets in output : ', buckets);

    const allFiles: any[] = [];
    for (const bucket of buckets) {
      const bucketName = bucket.name;
      const files: any[] = [];

      // fetch all files in all subfolders/buckets
      const stream = outputMinioClient.listObjectsV2(bucketName, '', true);
      await new Promise<void>((resolve, reject) => {
        // CREATE INTERFACE FOR DATA
        stream.on('data', async (obj: any) => {
          try {
            // check if the file actually exists
            //await outputMinioClient.statObject(bucketName, obj.name);

            // add existing files to the list
            files.push({
              bucket: bucketName,
              key: obj.name,
              size: obj.size,
              lastModified: obj.lastModified
            });
          } catch (statError) {
            console.warn(`File not found: ${obj.name}`, statError);
          }
        });

        stream.on('end', () => resolve());
        stream.on('error', (err) => reject(err));
      });

      allFiles.push(...files);
    }
    console.log(allFiles);
    return NextResponse.json(allFiles);
  } catch (error) {
    console.error('Error listing files:', error);
    return NextResponse.json({ error: 'Error fetching files from storage' });
  }
}
