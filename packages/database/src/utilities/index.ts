import path from 'node:path';
import fs from 'node:fs';
export function findWorkspaceRoot(): string {
  let currentDir = process.cwd();

  while (currentDir !== '/') {
    // Check if package.json exists in current directory
    if (fs.existsSync(path.join(currentDir, 'package.json'))) {
      try {
        const packageJson = JSON.parse(
          fs.readFileSync(path.join(currentDir, 'package.json'), 'utf8'),
        );

        // If this is a workspace root (has workspaces field)
        if (packageJson.workspaces) {
          return currentDir;
        }
      } catch (error) {
        // Continue if we can't parse the package.json
      }
    }

    // Move up one directory
    const parentDir = path.dirname(currentDir);

    // If we've reached the root directory and found nothing
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  // If no workspace root found, return current directory
  return process.cwd();
}
