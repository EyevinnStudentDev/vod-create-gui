import * as Minio from 'minio';

const MINIO_ENDPOINT_IN = process.env.AWS_URL || 'minio';
const MINIO_ENDPOINT_OUT = process.env.AWS_URL_OUT || 'minio';
const MINIO_PORT =
  process.env.AWS_SSL === 'true'
    ? 443
    : parseInt(process.env.MINIO_PORT || '9000', 10);
const MINIO_SSL = process.env.AWS_SSL === 'true';

// init output minio client
export const outputMinioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT_OUT.replace(/^http(s)?:\/\//, ''), // Remove protocol
  port: MINIO_PORT,
  useSSL: MINIO_SSL,
  accessKey: process.env.AWS_ACCESS_KEY_OUT || 'admin',
  secretKey:
    process.env.AWS_SECRET_ACCESS_KEY_OUT ||
    process.env.MINIO_SECRET_KEY ||
    'admin123'
});

// init input minio client
export const minioClient = new Minio.Client({
  endPoint: MINIO_ENDPOINT_IN.replace(/^http(s)?:\/\//, ''), // Remove protocol
  port: MINIO_PORT,
  useSSL: MINIO_SSL,
  accessKey: process.env.AWS_ACCESS_KEY || 'admin',
  secretKey:
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.MINIO_SECRET_KEY ||
    'admin123'
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
