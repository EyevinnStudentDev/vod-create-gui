import { NextRequest, NextResponse } from 'next/server';
import { deleteFileFromMinio } from '../../lib/file-managment';
export const dynamic = 'force-dynamic';

const bucketName = process.env.AWS_TENANT_BUCKET || '';
export async function DELETE(req: NextRequest) {
  try {
    const { fileName } = await req.json();
    console.log(fileName, bucketName);

    if (!fileName) {
      return NextResponse.json(
        { error: 'Bucket name and file name are required' },
        { status: 400 }
      );
    }

    await deleteFileFromMinio(bucketName, fileName);

    return NextResponse.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
