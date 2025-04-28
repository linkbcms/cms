//Please don't edit this file, it is automatically generated
// if you need to edit the file, please edit the route.ts file instead

import { authors } from "@linkbcms/schema/schema";
import { z } from "zod";
import { NextResponse, type NextRequest } from 'next/server';
import { desc, eq, linkbDb } from "@linkbcms/database";
const db = linkbDb();

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug) return listsAuthors();

  if (slug.length === 1 && slug[0]) {
    return getAuthors(slug[0]);
  }
  return NextResponse.json({ name: 'Not Found' }, { status: 404 });
}

export async function POST(req: NextRequest) {
  return createAuthors(req);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ name: 'Not Found' }, { status: 404 });

  if (slug.length === 1 && slug[0]) {
    return patchAuthors(slug[0], req);
  }
  return NextResponse.json({ name: 'Not Found' }, { status: 404 });
}

export async function DELETE(req: NextRequest,  { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ name: 'Not Found' }, { status: 404 });

  if (slug.length === 1 && slug[0]) {
    return deleteAuthors(slug[0]);
  }
  return NextResponse.json({ name: 'Not Found' }, { status: 404 });
}


async function listsAuthors() {
  const result = await db.select().from(authors).orderBy(desc(authors.id));
  return NextResponse.json({ result });
}

async function createAuthors(req: NextRequest) {
  let request: Promise<unknown>
  try{
    request = await req.json();
  }catch(error){  
    return NextResponse.json({ error : {name: "Payload empty"} }, { status: 400 });
  }
  try{
    const payload = createAuthorsValidation.parse(request);
    const result = await db.insert(authors).values(payload).returning();
    return NextResponse.json({ result });
  }catch(error){
    return NextResponse.json({ error: error }, { status: 400 });
  }
}

const createAuthorsValidation = z.object({
    name: z.string().optional().nullable()
});

async function getAuthors(id: string) {
  // Validate that ID is a number
  const numId = Number.parseInt(id);
  if (Number.isNaN(numId)) {
    return NextResponse.json({ name: "Invalid ID format. ID must be a number." }, { status: 400 });
  }

  const result = await db.select().from(authors).where(eq(authors.id, numId));
  if(result.length === 0) return NextResponse.json({ name: "authors not found" }, { status: 404 });
  return NextResponse.json({ name:"success", result: result[0] });
}

async function patchAuthors(id: string,req: NextRequest) {
  let request: Promise<unknown>
  try{
    request = await req.json();
  }catch(error){  
    return NextResponse.json({ error : {name: "Payload empty"} }, { status: 400 });
  }
  try{
    const payload = patchAuthorsValidation.parse(request);
    const result = await db.update(authors).set(payload).where(eq(authors.id, Number.parseInt(id))).returning();
    if(result.length === 0) return NextResponse.json({ name: "ID not found" }, { status: 404 });
    return NextResponse.json({ result });
  }catch(error){
    return NextResponse.json({ error: error }, { status: 400 });
  }
 
}

const patchAuthorsValidation = z.object({
    name: z.string().optional().nullable()
});

async function deleteAuthors(id: string) {
  // Validate that ID is a number
  const numId = Number.parseInt(id);
  if (Number.isNaN(numId)) {
    return NextResponse.json({ name: "Invalid ID format. ID must be a number." }, { status: 400 });
  }

  const result = await db.delete(authors).where(eq(authors.id, numId)).returning();
  if(result.length === 0) return NextResponse.json({ name: "authors not found" }, { status: 404 });
  return NextResponse.json({ name:"success", result: result[0] });
}

