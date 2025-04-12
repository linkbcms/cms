
import { NextResponse, NextRequest } from "next/server";
import { drizzle } from 'drizzle-orm/node-postgres';
import { custom } from "@linkbcms/schema/schema"
const db = drizzle(process.env.DATABASE_URL!);

export async function GET() {
    listsCustom();
}

export async function POST(req: NextRequest) {
    createCustom(req);
}



async function listsCustom() {
    const result = await db.select().from(custom);
    return NextResponse.json({ result });
}


async function createCustom(req: NextRequest) {
    const payload = await req.json();
    const result = await db.insert(custom).values(payload).returning();
    return NextResponse.json({ result });
}

