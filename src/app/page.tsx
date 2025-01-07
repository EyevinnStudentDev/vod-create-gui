'use client';
import { Link, Button } from '@nextui-org/react';

export default function Page() {
  return (
    <main className="flex justify-center items-center w-screen h-screen">
      <Button
        showAnchorIcon
        as={Link}
        color="primary"
        href="/upload"
        variant="solid"
      >
        Upload and Transcode
      </Button>
    </main>
  );
}
