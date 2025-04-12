
import { NextResponse, NextRequest } from "next/server";
import { drizzle } from 'drizzle-orm/node-postgres';
import { settings } from "@linkbcms/schema/schema"
import { z } from "zod";

const db = drizzle(process.env.DATABASE_URL!);
    

export async function GET() {
    return listsSettings();
}

export async function POST(req: NextRequest) {
    return createSettings(req);
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

