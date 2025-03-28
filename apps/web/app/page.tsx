// import { reader } from '@linkbcms/core/reader';
import { Button } from '@linkbcms/ui/components/button';
import type { JSX } from 'react';

export default function Page(): JSX.Element {
  // const cms = reader.api.getCollection.blogs.list();
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="font-bold text-2xl">Hello World</h1>
        <Button size="sm">Button</Button>
      </div>
    </div>
  );
}
