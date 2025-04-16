import { blogs } from '@linkbcms/schema/schema';
import { z } from 'zod';
import { NextResponse, type NextRequest } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
const db = drizzle(process.env.DATABASE_URL ?? '');

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  if (!slug) return listsBlogs();

  if (slug.length === 1 && slug[0]) {
    return getBlogs(slug[0]);
  }
  return NextResponse.json({ name: 'Not Found' }, { status: 404 });
}

export async function POST(req: NextRequest) {
  return createBlogs(req);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ name: 'Not Found' }, { status: 404 });

  if (slug.length === 1 && slug[0]) {
    return patchBlogs(slug[0], req);
  }
  return NextResponse.json({ name: 'Not Found' }, { status: 404 });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> },
) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ name: 'Not Found' }, { status: 404 });

  if (slug.length === 1 && slug[0]) {
    return deleteBlogs(slug[0]);
  }
  return NextResponse.json({ name: 'Not Found' }, { status: 404 });
}

async function listsBlogs() {
  const result = await db.select().from(blogs);
  return NextResponse.json({ result });
}

async function createBlogs(req: NextRequest) {
  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json(
      { error: { name: 'Payload empty' } },
      { status: 400 },
    );
  }
  try {
    createBlogsValidation.parse(payload);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 400 });
  }
  const result = await db.insert(blogs).values(payload).returning();
  return NextResponse.json({ result });
}

export const createBlogsValidation = z.object({
  title: z.string(),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  custom: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
});

async function getBlogs(id: string) {
  // Validate that ID is a number
  const numId = Number.parseInt(id);
  if (Number.isNaN(numId)) {
    return NextResponse.json(
      { name: 'Invalid ID format. ID must be a number.' },
      { status: 400 },
    );
  }

  const result = await db.select().from(blogs).where(eq(blogs.id, numId));
  if (result.length === 0)
    return NextResponse.json({ name: 'blogs not found' }, { status: 404 });
  return NextResponse.json({ name: 'success', result: result[0] });
}

async function patchBlogs(id: string, req: NextRequest) {
  let payload;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json(
      { error: { name: 'Payload empty' } },
      { status: 400 },
    );
  }
  try {
    patchBlogsValidation.parse(payload);
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 400 });
  }
  const result = await db
    .update(blogs)
    .set(payload)
    .where(eq(blogs.id, Number.parseInt(id)))
    .returning();
  if (result.length === 0)
    return NextResponse.json({ name: 'ID not found' }, { status: 404 });
  return NextResponse.json({ result });
}

export const patchBlogsValidation = z.object({
  title: z.string(),
  slug: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  date: z.string().optional().nullable(),
  custom: z.string().optional().nullable(),
  author: z.string().optional().nullable(),
});

async function deleteBlogs(id: string) {
  // Validate that ID is a number
  const numId = Number.parseInt(id);
  if (Number.isNaN(numId)) {
    return NextResponse.json(
      { name: 'Invalid ID format. ID must be a number.' },
      { status: 400 },
    );
  }

  const result = await db.delete(blogs).where(eq(blogs.id, numId)).returning();
  if (result.length === 0)
    return NextResponse.json({ name: 'blogs not found' }, { status: 404 });
  return NextResponse.json({ name: 'success', result: result[0] });
}
