import path from 'node:path';
import type {
  defineConfig,
  Collection,
  Singleton,
  CustomCollectionConfig,
  CollectionConfig,
  SingletonConfig,
} from '../../type';
import { findWorkspaceRoot } from '../utilities/findWorkSpaceRoot';
import fs from 'node:fs';
require('esbuild-register');

export class Api {
  private cmsConfig: ReturnType<typeof defineConfig>;
  private apiPath: string;
  private schemaPath: string;
  constructor() {
    const filePath = path.resolve(`cms.config.tsx`);
    this.cmsConfig = require(filePath).default as ReturnType<
      typeof defineConfig
    >;
    const workspaceRoot = findWorkspaceRoot();
    this.apiPath = path.join(workspaceRoot, 'apps/web/app/api');
    this.schemaPath = path.join(
      workspaceRoot,
      'apps/web/database/schema/schema.ts',
    );
  }
  execute() {
    if (this.cmsConfig.collections) {
      for (const [collectionName, collectionConfig] of Object.entries(
        this.cmsConfig.collections,
      )) {
        if ('Component' in collectionConfig) continue;
        this.generateDefaultCrud(collectionName, collectionConfig);
      }
    }
  }

  /**
   * Ensures that a folder for the collection exists
   * @param collectionName The name of the collection
   * @returns The path to the collection folder
   */
  createFolder(collectionName: string): string {
    // Create the path to the collection folder
    const collectionPath = path.join(this.apiPath, collectionName);
    // Check if the folder exists
    if (!fs.existsSync(collectionPath)) {
      // Create the folder and any parent folders if they don't exist
      fs.mkdirSync(collectionPath, { recursive: true });
    }

    return collectionPath;
  }

  generateDefaultCrud(
    collectionName: string,
    collectionConfig:
      | Collection<Record<string, CollectionConfig>, string>
      | Singleton<Record<string, SingletonConfig>>
      | CustomCollectionConfig,
  ) {
    const collectionPath = this.createFolder(collectionName);
    const collectionSubPath = this.createFolder(`${collectionName}/[id]`);
    const listCode = this.generateList(collectionName, collectionConfig);
    const createCode = this.generateCreate(
      collectionName,
      collectionConfig as Collection<Record<string, CollectionConfig>, string>,
    );

    const combineRootCode = `
import { NextResponse, NextRequest } from "next/server";
import { drizzle } from 'drizzle-orm/node-postgres';
import { ${collectionName} } from "@linkbcms/schema/schema"
${this.defaultHeader()}

export async function GET() {
    return ${listCode.functionName}();
}

export async function POST(req: NextRequest) {
    return ${createCode.functionName}(req);
}

${listCode.code}
${createCode.code}
`;
    fs.writeFileSync(path.join(collectionPath, `route.ts`), combineRootCode);

    const getCode = this.generateGet(collectionName, collectionConfig);
    const deleteCode = this.generateDelete(collectionName, collectionConfig);

    const combineSubCode = `
import { NextResponse, NextRequest } from "next/server";
import { drizzle } from 'drizzle-orm/node-postgres';
import { ${collectionName} } from "@linkbcms/schema/schema"
import { eq } from "drizzle-orm";
${this.defaultHeader()}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    const id = params.id;
    return ${getCode.functionName}(id);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const id = params.id;
    return ${deleteCode.functionName}(id);
}

${getCode.code}
${deleteCode.code}
`;
    fs.writeFileSync(path.join(collectionSubPath, `route.ts`), combineSubCode);
  }

  generateList(
    collectionName: string,
    collectionConfig:
      | Collection<Record<string, CollectionConfig>, string>
      | Singleton<Record<string, SingletonConfig>>
      | CustomCollectionConfig,
  ): {
    code: string;
    functionName: string;
  } {
    const functionName = `lists${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}`;
    // Create clean, properly formatted code without extra indentation
    const code = `
async function ${functionName}() {
    const result = await db.select().from(${collectionName});
    return NextResponse.json({ result });
}
`;
    return {
      code,
      functionName,
    };
  }

  generateCreate(
    collectionName: string,
    collectionConfig: Collection<Record<string, CollectionConfig>, string>,
  ): {
    code: string;
    functionName: string;
  } {
    const { schema } = collectionConfig as CollectionConfig;
    const validation = this.generateValidation(schema);

    const functionName = `create${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}`;
    // Create clean, properly formatted code without extra indentation
    const code = `
async function ${functionName}(req: NextRequest) {
    const payload = await req.json();
    try{
        ${functionName}Validation.parse(payload);
    }catch(error){
        return NextResponse.json({ error: error }, { status: 400 });
    }
    const result = await db.insert(${collectionName}).values(payload).returning();
    return NextResponse.json({ result });
}

export const ${functionName}Validation = ${validation});
`;
    return {
      code,
      functionName,
    };
  }

  generateGet(
    collectionName: string,
    collectionConfig:
      | Collection<Record<string, CollectionConfig>, string>
      | Singleton<Record<string, SingletonConfig>>
      | CustomCollectionConfig,
  ): {
    code: string;
    functionName: string;
  } {
    const functionName = `get${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}`;
    // Create clean, properly formatted code without extra indentation
    const code = `
async function ${functionName}(id: string) {
    // Validate that ID is a number
    const numId = parseInt(id);
    if (isNaN(numId)) {
      return NextResponse.json({ message: "Invalid ID format. ID must be a number." }, { status: 400 });
    }

    const result = await db.select().from(${collectionName}).where(eq(${collectionName}.id, numId));
    if(result.length === 0) return NextResponse.json({ message: "blog not found" }, { status: 404 });
    return NextResponse.json({ message:"success", result: result[0] });
}
`;
    return {
      code,
      functionName,
    };
  }

  generateDelete(
    collectionName: string,
    collectionConfig:
      | Collection<Record<string, CollectionConfig>, string>
      | Singleton<Record<string, SingletonConfig>>
      | CustomCollectionConfig,
  ): {
    code: string;
    functionName: string;
  } {
    const functionName = `delete${collectionName.charAt(0).toUpperCase() + collectionName.slice(1)}`;
    // Create clean, properly formatted code without extra indentation
    const code = `async function ${functionName}(id: string) {
    // Validate that ID is a number
    const numId = parseInt(id);
    if (isNaN(numId)) {
      return NextResponse.json({ message: "Invalid ID format. ID must be a number." }, { status: 400 });
    }

    const result = await db.delete(${collectionName}).where(eq(${collectionName}.id, numId)).returning();
    if(result.length === 0) return NextResponse.json({ message: "blog not found" }, { status: 404 });
    return NextResponse.json({ message:"success", result: result[0] });
}
`;
    return {
      code,
      functionName,
    };
  }

  defaultHeader() {
    return `import { z } from "zod";

const db = drizzle(process.env.DATABASE_URL!);
    `;
  }

  generateValidation(schema: Record<string, Record<string, unknown>>): string {
    const validation: Record<string, string> = {};
    for (const key in schema) {
      const schemaValue = schema[key];
      validation[key] = `z.string()`;
      if (schemaValue?.required !== true)
        validation[key] += `.optional().nullable()`;
    }
    if (Object.keys(validation).length === 0) return ``;
    return `z.object({
    ${Object.entries(validation)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ')}
}`;
  }
}
