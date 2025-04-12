
import { NextResponse, NextRequest } from "next/server";
import { drizzle } from 'drizzle-orm/node-postgres';
import { blogs } from "@linkbcms/schema/schema"
import { z } from "zod";

const db = drizzle(process.env.DATABASE_URL!);
    

export async function GET() {
    return listsBlogs();
}

export async function POST(req: NextRequest) {
    return createBlogs(req);
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
    title: z.string(), slug: z.string().optional().nullable(), content: z.string().optional().nullable(), image: z.string().optional().nullable(), date: z.string().optional().nullable(), custom: z.string().optional().nullable(), author: z.string().optional().nullable()
});

