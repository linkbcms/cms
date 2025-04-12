
import { blogs } from "@linkbcms/schema/schema"
import { z } from "zod";
import { NextResponse, type NextRequest } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from "drizzle-orm";
const db = drizzle(process.env.DATABASE_URL ?? '');
    

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (id) {
    return getBlogs(id);
  }
  return listsBlogs();
}

export async function POST(req: NextRequest) {
    return createBlogs(req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  return deleteBlogs(id);
}


async function listsBlogs() {
    const result = await db.select().from(blogs);
    return NextResponse.json({ result });
}


async function createBlogs(req: NextRequest) {
    const payload = await req.json();
    try{
        createBlogsValidation.parse(payload);
    }catch(error){
        return NextResponse.json({ error: error }, { status: 400 });
    }
    const result = await db.insert(blogs).values(payload).returning();
    return NextResponse.json({ result });
}

export const createBlogsValidation = z.object({
    title: z.string(), slug: z.string().optional().nullable(), description: z.string().optional().nullable(), content: z.string().optional().nullable(), image: z.string().optional().nullable(), date: z.string().optional().nullable(), custom: z.string().optional().nullable(), author: z.string().optional().nullable()
});


async function getBlogs(id: string) {
    // Validate that ID is a number
    const numId = parseInt(id);
    if (isNaN(numId)) {
      return NextResponse.json({ message: "Invalid ID format. ID must be a number." }, { status: 400 });
    }

    const result = await db.select().from(blogs).where(eq(blogs.id, numId));
    if(result.length === 0) return NextResponse.json({ message: "blog not found" }, { status: 404 });
    return NextResponse.json({ message:"success", result: result[0] });
}

async function deleteBlogs(id: string) {
    // Validate that ID is a number
    const numId = parseInt(id);
    if (isNaN(numId)) {
      return NextResponse.json({ message: "Invalid ID format. ID must be a number." }, { status: 400 });
    }

    const result = await db.delete(blogs).where(eq(blogs.id, numId)).returning();
    if(result.length === 0) return NextResponse.json({ message: "blog not found" }, { status: 404 });
    return NextResponse.json({ message:"success", result: result[0] });
}

