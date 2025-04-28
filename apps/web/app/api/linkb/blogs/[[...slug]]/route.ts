//Please don't edit this file, it is automatically generated
// if you need to edit the file, please edit the route.ts file instead

import { blogs } from "@linkbcms/schema/schema";
import { z } from "zod";
import { NextResponse, type NextRequest } from 'next/server';
import { desc, eq, linkbDb } from "@linkbcms/database";
const db = linkbDb();

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ name: 'Not Found' }, { status: 404 });

  if (slug.length === 1 && slug[0]) {
    return patchBlogs(slug[0], req);
  }
  return NextResponse.json({ name: 'Not Found' }, { status: 404 });
}

export async function DELETE(req: NextRequest,  { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ name: 'Not Found' }, { status: 404 });

  if (slug.length === 1 && slug[0]) {
    return deleteBlogs(slug[0]);
  }
  return NextResponse.json({ name: 'Not Found' }, { status: 404 });
}


async function listsBlogs() {
  const result = await db.select().from(blogs).orderBy(desc(blogs.id));
  return NextResponse.json({ result });
}

async function createBlogs(req: NextRequest) {
  let request: Promise<unknown>
  try{
    request = await req.json();
  }catch(error){  
    return NextResponse.json({ error : {name: "Payload empty"} }, { status: 400 });
  }
  try{
    const payload = createBlogsValidation.parse(request);
    const result = await db.insert(blogs).values(payload).returning();
    return NextResponse.json({ result });
  }catch(error){
    return NextResponse.json({ error: error }, { status: 400 });
  }
}

const createBlogsValidation = z.object({
    title: z.string(), order: z.number(), status: z.enum(["draft", "published", "archived"]), slug: z.string().optional().nullable(), content: z.string().optional().nullable(), image: z.string().optional().nullable(), date: z.string().optional().nullable(), custom: z.string().optional().nullable(), author: z.string().optional().nullable()
});

async function getBlogs(id: string) {
  // Validate that ID is a number
  const numId = Number.parseInt(id);
  if (Number.isNaN(numId)) {
    return NextResponse.json({ name: "Invalid ID format. ID must be a number." }, { status: 400 });
  }

  const result = await db.select().from(blogs).where(eq(blogs.id, numId));
  if(result.length === 0) return NextResponse.json({ name: "blogs not found" }, { status: 404 });
  return NextResponse.json({ name:"success", result: result[0] });
}

async function patchBlogs(id: string,req: NextRequest) {
  let request: Promise<unknown>
  try{
    request = await req.json();
  }catch(error){  
    return NextResponse.json({ error : {name: "Payload empty"} }, { status: 400 });
  }
  try{
    const payload = patchBlogsValidation.parse(request);
    const result = await db.update(blogs).set(payload).where(eq(blogs.id, Number.parseInt(id))).returning();
    if(result.length === 0) return NextResponse.json({ name: "ID not found" }, { status: 404 });
    return NextResponse.json({ result });
  }catch(error){
    return NextResponse.json({ error: error }, { status: 400 });
  }
 
}

const patchBlogsValidation = z.object({
    title: z.string(), order: z.number(), status: z.enum(["draft", "published", "archived"]), slug: z.string().optional().nullable(), content: z.string().optional().nullable(), image: z.string().optional().nullable(), date: z.string().optional().nullable(), custom: z.string().optional().nullable(), author: z.string().optional().nullable()
});

async function deleteBlogs(id: string) {
  // Validate that ID is a number
  const numId = Number.parseInt(id);
  if (Number.isNaN(numId)) {
    return NextResponse.json({ name: "Invalid ID format. ID must be a number." }, { status: 400 });
  }

  const result = await db.delete(blogs).where(eq(blogs.id, numId)).returning();
  if(result.length === 0) return NextResponse.json({ name: "blogs not found" }, { status: 404 });
  return NextResponse.json({ name:"success", result: result[0] });
}

