//Please don't edit this file, it is automatically generated
// if you need to edit the file, please edit the route.ts file instead

import { settings2 } from "@linkbcms/schema/schema";
import { z } from "zod";
import { NextResponse, type NextRequest } from 'next/server';
import { desc, eq, linkbDb } from "@linkbcms/database";
const db = linkbDb();

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug) return listsSettings2();

  if (slug.length === 1 && slug[0]) {
    return getSettings2(slug[0]);
  }
  return NextResponse.json({ name: 'Not Found' }, { status: 404 });
}

export async function POST(req: NextRequest) {
  return createSettings2(req);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ name: 'Not Found' }, { status: 404 });

  if (slug.length === 1 && slug[0]) {
    return patchSettings2(slug[0], req);
  }
  return NextResponse.json({ name: 'Not Found' }, { status: 404 });
}

export async function DELETE(req: NextRequest,  { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ name: 'Not Found' }, { status: 404 });

  if (slug.length === 1 && slug[0]) {
    return deleteSettings2(slug[0]);
  }
  return NextResponse.json({ name: 'Not Found' }, { status: 404 });
}


async function listsSettings2() {
  const result = await db.select().from(settings2).orderBy(desc(settings2.id));
  return NextResponse.json({ result });
}

async function createSettings2(req: NextRequest) {
  let request: Promise<unknown>
  try{
    request = await req.json();
  }catch(error){  
    return NextResponse.json({ error : {name: "Payload empty"} }, { status: 400 });
  }
  try{
    const payload = createSettings2Validation.parse(request);
    const result = await db.insert(settings2).values(payload).returning();
    return NextResponse.json({ result });
  }catch(error){
    return NextResponse.json({ error: error }, { status: 400 });
  }
}

const createSettings2Validation = z.object({
    title: z.string().optional().nullable(), navigation: z.string().optional().nullable(), description: z.string().optional().nullable()
});

async function getSettings2(id: string) {
  // Validate that ID is a number
  const numId = Number.parseInt(id);
  if (Number.isNaN(numId)) {
    return NextResponse.json({ name: "Invalid ID format. ID must be a number." }, { status: 400 });
  }

  const result = await db.select().from(settings2).where(eq(settings2.id, numId));
  if(result.length === 0) return NextResponse.json({ name: "settings2 not found" }, { status: 404 });
  return NextResponse.json({ name:"success", result: result[0] });
}

async function patchSettings2(id: string,req: NextRequest) {
  let request: Promise<unknown>
  try{
    request = await req.json();
  }catch(error){  
    return NextResponse.json({ error : {name: "Payload empty"} }, { status: 400 });
  }
  try{
    const payload = patchSettings2Validation.parse(request);
    const result = await db.update(settings2).set(payload).where(eq(settings2.id, Number.parseInt(id))).returning();
    if(result.length === 0) return NextResponse.json({ name: "ID not found" }, { status: 404 });
    return NextResponse.json({ result });
  }catch(error){
    return NextResponse.json({ error: error }, { status: 400 });
  }
 
}

const patchSettings2Validation = z.object({
    title: z.string().optional().nullable(), navigation: z.string().optional().nullable(), description: z.string().optional().nullable()
});

async function deleteSettings2(id: string) {
  // Validate that ID is a number
  const numId = Number.parseInt(id);
  if (Number.isNaN(numId)) {
    return NextResponse.json({ name: "Invalid ID format. ID must be a number." }, { status: 400 });
  }

  const result = await db.delete(settings2).where(eq(settings2.id, numId)).returning();
  if(result.length === 0) return NextResponse.json({ name: "settings2 not found" }, { status: 404 });
  return NextResponse.json({ name:"success", result: result[0] });
}

