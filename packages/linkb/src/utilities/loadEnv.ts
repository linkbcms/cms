import path from "path";
import dotenv from "dotenv";
import fs from "fs";

export const loadEnv = (workspaceRoot: string) => {
  const envPath = path.join(workspaceRoot, ".env");
  if (fs.existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) return false;
    return true;
  }
  return false;
};
