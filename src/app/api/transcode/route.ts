import { NextResponse } from 'next/server';
import { Context } from '@osaas/client-core';
import { createVod, createVodPipeline } from '@osaas/client-transcode';

interface PresignedUrlData {
  fileNameInBucket: string;
  url: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { presignedUrls }: { presignedUrls: PresignedUrlData[] } = body;
    console.log(presignedUrls);

    if (!presignedUrls || !Array.isArray(presignedUrls)) {
      return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
    }

    // init Eyevinn transcoding SDK
    const ctx = new Context({
      personalAccessToken: process.env.OSC_ACCESS_TOKEN
    });
    ctx.activateService('minio');
    const pipeline = await createVodPipeline('output', ctx);

    // transcode all presigned URLs in the array
    const results = await Promise.all(
      presignedUrls.map(async (urlData) => {
        const vod = await createVod(pipeline, urlData.url, ctx);
        console.log('VOD :  ', vod);
        return vod;
      })
    );

    return NextResponse.json({ message: 'Transcoding successful', results });
  } catch (error: any) {
    console.error('Error during transcoding:', error);
    return NextResponse.json(
      { error: 'Transcoding failed', details: error.message },
      { status: 500 }
    );
  }
}
