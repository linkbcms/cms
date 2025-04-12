
import { authors } from "@linkbcms/schema/schema"
import { z } from "zod";
import { NextResponse, type NextRequest } from 'next/server';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from "drizzle-orm";
const db = drizzle(process.env.DATABASE_URL ?? '');
    

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  if (id) {
    return getAuthors(id);
  }
  return listsAuthors();
}

export async function POST(req: NextRequest) {
    return createAuthors(req);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id;
  return deleteAuthors(id);
}


async function listsAuthors() {
    const result = await db.select().from(authors);
    return NextResponse.json({ result });
}


async function createAuthors(req: NextRequest) {
    const payload = await req.json();
    try{
        createAuthorsValidation.parse(payload);
    }catch(error){
        return NextResponse.json({ error: error }, { status: 400 });
    }
    const result = await db.insert(authors).values(payload).returning();
    return NextResponse.json({ result });
}

export const createAuthorsValidation = z.object({
    name: z.string().optional().nullable()
});


async function getAuthors(id: string) {
    // Validate that ID is a number
    const numId = parseInt(id);
    if (isNaN(numId)) {
      return NextResponse.json({ message: "Invalid ID format. ID must be a number." }, { status: 400 });
    }

    const result = await db.select().from(authors).where(eq(authors.id, numId));
    if(result.length === 0) return NextResponse.json({ message: "blog not found" }, { status: 404 });
    return NextResponse.json({ message:"success", result: result[0] });
}

async function deleteAuthors(id: string) {
    // Validate that ID is a number
    const numId = parseInt(id);
    if (isNaN(numId)) {
      return NextResponse.json({ message: "Invalid ID format. ID must be a number." }, { status: 400 });
    }

    const result = await db.delete(authors).where(eq(authors.id, numId)).returning();
    if(result.length === 0) return NextResponse.json({ message: "blog not found" }, { status: 404 });
    return NextResponse.json({ message:"success", result: result[0] });
}

