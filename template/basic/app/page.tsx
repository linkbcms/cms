import Link from 'next/link';
import type { JSX } from 'react';

export default function Page(): JSX.Element {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="font-bold text-2xl">Hello World!</h1>

        <p>
          This is a demo of the Link CMS. It is a simple CMS that allows you to
          manage your content.
        </p>

        <Link href="/cms" className="underline">
          Enter CMS
        </Link>
      </div>
    </div>
  );
}
