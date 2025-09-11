import Link from 'next/link';

export default function Page() {
  return (
    <div className="flex flex-col gap-4 text-2xl">
      Hello World
      <Link href="/cms">Enter CMS</Link>
    </div>
  );
}
