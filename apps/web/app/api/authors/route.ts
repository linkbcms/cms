
import { NextResponse, NextRequest } from "next/server";
import { drizzle } from 'drizzle-orm/node-postgres';
import { authors } from "@linkbcms/schema/schema"
import { z } from "zod";

const db = drizzle(process.env.DATABASE_URL!);
    

export async function GET() {
    return listsAuthors();
}

export async function POST(req: NextRequest) {
    return createAuthors(req);
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

