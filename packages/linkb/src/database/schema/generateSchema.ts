import { join } from "path";
import fs from "fs";
import path from "path";
import { Schema, SchemaDefinition } from "./types";

export default function GenerateSchema(schemaDir: string) {
  const exampleFilePath = path.join(schemaDir, "example.json");

  let exampleData: SchemaDefinition | null = null;
  if (fs.existsSync(exampleFilePath)) {
    try {
      const exampleContent = fs.readFileSync(exampleFilePath, "utf-8");
      exampleData = JSON.parse(exampleContent);
    } catch (error) {
      console.error("Error reading or parsing example.json:", error);
      return null;
    }
  } else {
    console.log("example.json not found in schema directory");
    return null;
  }

  if (!exampleData) {
    console.error("Invalid example data");
    return null;
  }

  const newSchema = jsonToSchema(exampleData);
  return newSchema;

  const lockFilePath = join(schemaDir, "schema/schema.lock");

  // Read the timestamp from schema.lock
  let lastProcessedTimestamp = "0";
  if (fs.existsSync(lockFilePath)) {
    lastProcessedTimestamp = fs.readFileSync(lockFilePath, "utf-8").trim();
    console.log(`Last processed timestamp: ${lastProcessedTimestamp}`);
  } else {
    console.log("No schema.lock found, will process all JSON files");
  }

  // Get all JSON files in the schema directory
  const files = fs.readdirSync(schemaDir + "/schema");
  const jsonFiles = files.filter(
    (file) =>
      file.endsWith(".json") &&
      file !== "schema.lock" &&
      file > lastProcessedTimestamp
  );

  if (jsonFiles.length === 0) {
    console.log("No new schema files to process");
    return [];
  }

  console.log(`Found ${jsonFiles.length} new schema files to process:`);
  jsonFiles.forEach((file) => console.log(`- ${file}`));

  // Sort files by timestamp (filename)
  const sortedFiles = jsonFiles.sort();
  console.log(exampleData);
  // Process each file
  //   const processedFiles = sortedFiles.map(file => {
  //     const filePath = join(schemaDir, file);
  //     try {
  //       const fileContent = fs.readFileSync(filePath, "utf-8");
  //       const schemaData = JSON.parse(fileContent);
  //       return {
  //         timestamp: file.replace(".json", ""),
  //         filePath,
  //         data: schemaData
  //       };
  //     } catch (error) {
  //       console.error(`Error processing ${file}: ${error}`);
  //       return null;
  //     }
  //   }).filter(Boolean);

  //   // Update schema.lock with the latest timestamp
  //   if (processedFiles.length > 0) {
  //     const latestTimestamp = sortedFiles[sortedFiles.length - 1].replace(".json", "");
  //     fs.writeFileSync(lockFilePath, latestTimestamp);
  //     console.log(`Updated schema.lock to ${latestTimestamp}`);
  //   }

  //   return processedFiles;
  return "test";
}

const jsonToSchema = (json: SchemaDefinition) => {
  const { collections } = json;
  if (!collections) {
    console.error("Invalid collections: 'collections' property is missing");
    return null;
  }
  console.log(collections);

//   const newSchema: Record<string, any> = {};
  
//   // Process each field in the schema
//   Object.entries(schema).forEach(([fieldName, fieldDef]) => {
//     newSchema[fieldName] = processField(fieldName, fieldDef);
//   });
  
//   console.log(newSchema);
//   return newSchema;
};

const processField = (fieldName: string, fieldDef: any) => {
  // Start with basic field properties
  const processedField: Record<string, any> = {
    name: fieldName,
  };
  
  // Add other properties from the definition
  if (fieldDef.required) processedField.required = fieldDef.required;
  if (fieldDef.multiline) processedField.multiline = fieldDef.multiline;
  if (fieldDef.i18n) processedField.i18n = fieldDef.i18n;
  
  // Handle relationship fields
  if (fieldDef.collection) {
    processedField.type = 'relation';
    processedField.collection = fieldDef.collection;
    if (fieldDef.db === false) processedField.db = false;
  }
  
  return processedField;
};
