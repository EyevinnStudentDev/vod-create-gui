import * as Minio from 'minio';

// init output minio client
export const outputMinioClient = new Minio.Client({
  endPoint: 'devstudent-output.minio-minio.auto.prod.osaas.io',
  useSSL: process.env.AWS_SSL === 'true',
  accessKey: 'root',
  secretKey: '0511db45f60e48b70a26850740a6f3ac'
});

// init input minio client
export const minioClient = new Minio.Client({
  endPoint: process.env.AWS_URL || '',
  port: 443,
  useSSL: process.env.AWS_SSL === 'true',
  accessKey: process.env.AWS_ACCESS_KEY || '',
  secretKey: process.env.AWS_SECRET_ACCESS_KEY || ''
});

export async function createPresignedUrlToUpload({
  bucketName,
  fileName,
  expiry = 60 * 60 // 1 hour
}: {
  bucketName: string;
  fileName: string;
  expiry?: number;
}): Promise<string> {
  try {
    // generate a presigned PUT URL to upload file to bucket
    const presignedUrl = await minioClient.presignedPutObject(
      bucketName,
      fileName,
      expiry
    );
    return presignedUrl;
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw new Error('Failed to generate pre-signed URL');
  }
}

// function to delete a file from minIO
export async function deleteFileFromMinio(
  bucketName: string,
  fileName: string
): Promise<void> {
  try {
    await minioClient.removeObject(bucketName, fileName);
    console.log(
      `File ${fileName} deleted successfully from bucket ${bucketName}`
    );
  } catch (error) {
    console.error('Error deleting file from MinIO:', error);
    throw new Error('Failed to delete file');
  }
}
