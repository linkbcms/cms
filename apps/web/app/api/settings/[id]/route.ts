
import { NextResponse, NextRequest } from "next/server";
import { drizzle } from 'drizzle-orm/node-postgres';
import { settings } from "@linkbcms/schema/schema"
import { eq } from "drizzle-orm";
import { z } from "zod";

const db = drizzle(process.env.DATABASE_URL!);
    

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const id = params.id;
    return getSettings(id);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const id = params.id;
    return deleteSettings(id);
}


async function getSettings(id: string) {
    // Validate that ID is a number
    const numId = parseInt(id);
    if (isNaN(numId)) {
      return NextResponse.json({ message: "Invalid ID format. ID must be a number." }, { status: 400 });
    }

    const result = await db.select().from(settings).where(eq(settings.id, numId));
    if(result.length === 0) return NextResponse.json({ message: "blog not found" }, { status: 404 });
    return NextResponse.json({ message:"success", result: result[0] });
}

async function deleteSettings(id: string) {
    // Validate that ID is a number
    const numId = parseInt(id);
    if (isNaN(numId)) {
      return NextResponse.json({ message: "Invalid ID format. ID must be a number." }, { status: 400 });
    }

    const result = await db.delete(settings).where(eq(settings.id, numId)).returning();
    if(result.length === 0) return NextResponse.json({ message: "blog not found" }, { status: 404 });
    return NextResponse.json({ message:"success", result: result[0] });
}

