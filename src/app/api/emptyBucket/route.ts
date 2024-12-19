import { outputMinioClient } from '../../lib/file-managment'; 
import { NextRequest, NextResponse } from 'next/server';

const bucketName = 'output';

// THIS FUNCTION IS SOLEY FOR DEBUGGING
export async function DELETE(req: NextRequest) {
  try {
    const objectsList = [];
    const stream = outputMinioClient.listObjectsV2(bucketName, '', true);

    // collect all objects
    for await (const obj of stream) {
      objectsList.push({ name: obj.name });
    }

    if (objectsList.length === 0) {
      return NextResponse.json({ message: 'Bucket is already empty' });
    }

    // remove all collected objects
    await outputMinioClient.removeObjects(
      bucketName,
      objectsList.map((obj) => obj.name)
    );

    return NextResponse.json({
      message: `All ${objectsList.length} objects deleted successfully`,
    });
  } catch (error) {
    console.error('Error emptying bucket:', error);
    return NextResponse.json(
      { error: 'Failed to empty the bucket' },
      { status: 500 }
    );
  }
}
