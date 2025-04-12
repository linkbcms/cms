
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
  return NextResponse.json({ message: 'Not Found' }, { status: 404 });
}

export async function POST(req: NextRequest) {
    return createSettings(req);
}

export async function DELETE(req: NextRequest,  { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  if (!slug) return NextResponse.json({ message: 'Not Found' }, { status: 404 });

  if (slug.length === 1 && slug[0]) {
    return deleteSettings(slug[0]);
  }
  return NextResponse.json({ status: 404 });
}


async function listsSettings() {
    const result = await db.select().from(settings);
    return NextResponse.json({ result });
}


async function createSettings(req: NextRequest) {
    const payload = await req.json();
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
      return NextResponse.json({ message: "Invalid ID format. ID must be a number." }, { status: 400 });
    }

    const result = await db.select().from(settings).where(eq(settings.id, numId));
    if(result.length === 0) return NextResponse.json({ message: "blog not found" }, { status: 404 });
    return NextResponse.json({ message:"success", result: result[0] });
}

async function deleteSettings(id: string) {
    // Validate that ID is a number
    const numId = Number.parseInt(id);
    if (Number.isNaN(numId)) {
      return NextResponse.json({ message: "Invalid ID format. ID must be a number." }, { status: 400 });
    }

    const result = await db.delete(settings).where(eq(settings.id, numId)).returning();
    if(result.length === 0) return NextResponse.json({ message: "blog not found" }, { status: 404 });
    return NextResponse.json({ message:"success", result: result[0] });
}

