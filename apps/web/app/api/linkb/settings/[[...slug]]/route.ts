
import { settings } from "@linkbcms/schema/schema"
import { z } from "zod";
import { NextResponse, type NextRequest } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from "drizzle-orm";
const db = drizzle(process.env.DATABASE_URL ?? '');

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug) return listsSettings();

  if (slug.length === 1 && slug[0]) {
    return getSettings(slug[0]);
  }
  return NextResponse.json({ name: 'Not Found' }, { status: 404 });
}

export async function POST(req: NextRequest) {
  return createSettings(req);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ name: 'Not Found' }, { status: 404 });

  if (slug.length === 1 && slug[0]) {
    return patchSettings(slug[0], req);
  }
  return NextResponse.json({ name: 'Not Found' }, { status: 404 });
}

export async function DELETE(req: NextRequest,  { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ name: 'Not Found' }, { status: 404 });

  if (slug.length === 1 && slug[0]) {
    return deleteSettings(slug[0]);
  }
  return NextResponse.json({ name: 'Not Found' }, { status: 404 });
}


async function listsSettings() {
    const result = await db.select().from(settings);
    return NextResponse.json({ result });
}


async function createSettings(req: NextRequest) {
  let payload
  try{
    payload = await req.json();
  }catch(error){  
    return NextResponse.json({ error : {name: "Payload empty"} }, { status: 400 });
  }
  try{
      createSettingsValidation.parse(payload);
  }catch(error){
      return NextResponse.json({ error: error }, { status: 400 });
  }
  const result = await db.insert(settings).values(payload).returning();
  return NextResponse.json({ result });
}

export const createSettingsValidation = z.object({
    title: z.string().optional().nullable(), navigation: z.string().optional().nullable(), description: z.string().optional().nullable()
});


async function getSettings(id: string) {
  // Validate that ID is a number
  const numId = Number.parseInt(id);
  if (Number.isNaN(numId)) {
    return NextResponse.json({ name: "Invalid ID format. ID must be a number." }, { status: 400 });
  }

  const result = await db.select().from(settings).where(eq(settings.id, numId));
  if(result.length === 0) return NextResponse.json({ name: "settings not found" }, { status: 404 });
  return NextResponse.json({ name:"success", result: result[0] });
}


async function patchSettings(id: string,req: NextRequest) {
  let payload
  try{
    payload = await req.json();
  }catch(error){  
    return NextResponse.json({ error : {name: "Payload empty"} }, { status: 400 });
  }
  try{
    patchSettingsValidation.parse(payload);
  }catch(error){
    return NextResponse.json({ error: error }, { status: 400 });
  }
  const result = await db.update(settings).set(payload).where(eq(settings.id, Number.parseInt(id))).returning();
  if(result.length === 0) return NextResponse.json({ name: "ID not found" }, { status: 404 });
  return NextResponse.json({ result });
}

export const patchSettingsValidation = z.object({
    title: z.string().optional().nullable(), navigation: z.string().optional().nullable(), description: z.string().optional().nullable()
});

async function deleteSettings(id: string) {
  // Validate that ID is a number
  const numId = Number.parseInt(id);
  if (Number.isNaN(numId)) {
    return NextResponse.json({ name: "Invalid ID format. ID must be a number." }, { status: 400 });
  }

  const result = await db.delete(settings).where(eq(settings.id, numId)).returning();
  if(result.length === 0) return NextResponse.json({ name: "settings not found" }, { status: 404 });
  return NextResponse.json({ name:"success", result: result[0] });
}

