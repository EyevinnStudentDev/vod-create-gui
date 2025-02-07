import * as Minio from 'minio';

const MINIO_ENDPOINT_IN =
  process.env.AWS_URL || process.env.MINIO_ENDPOINT || 'minio';
const MINIO_ENDPOINT_OUT =
  process.env.AWS_URL_OUT || process.env.MINIO_ENDPOINT || 'minio';
const MINIO_PORT =
  process.env.AWS_SSL === 'true'
    ? 443
    : parseInt(process.env.MINIO_PORT || '9000', 10);
const MINIO_SSL = process.env.AWS_SSL === 'true';

console.log('🔍 Debugging Environment Variables:');
console.log('AWS_URL:', process.env.AWS_URL);
console.log('AWS_URL_OUT:', process.env.AWS_URL_OUT);
console.log('MINIO_ENDPOINT:', process.env.MINIO_ENDPOINT);
console.log('AWS_ACCESS_KEY:', process.env.AWS_ACCESS_KEY);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);
console.log('AWS_ACCESS_KEY_OUT:', process.env.AWS_ACCESS_KEY_OUT);
console.log(
  'AWS_SECRET_ACCESS_KEY_OUT:',
  process.env.AWS_SECRET_ACCESS_KEY_OUT
);
console.log('AWS_TENANT_BUCKET:', process.env.AWS_TENANT_BUCKET);
console.log('AWS_SSL:', process.env.AWS_SSL);
console.log('MINIO_PORT:', process.env.MINIO_PORT);
console.log('🔍 MinIO Configuration:');
console.log('MINIO_ENDPOINT_IN:', MINIO_ENDPOINT_IN);
console.log('MINIO_ENDPOINT_OUT:', MINIO_ENDPOINT_OUT);
console.log('MINIO_PORT:', MINIO_PORT);
console.log('MINIO_SSL:', MINIO_SSL);

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
