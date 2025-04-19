import path from 'node:path';
import fs from 'node:fs';
import chalk from 'chalk';

export const findWorkspaceRoot = (locationPath = ''): string => {
  let location = locationPath.startsWith('/')
    ? locationPath
    : `/${locationPath}`;
  location = location.endsWith('/') ? location.slice(0, -1) : location;

  let currentDir = process.cwd();

  // Traverse up until we find pnpm-workspace.yaml
  while (currentDir !== path.parse(currentDir).root) {
    const cmsConfigPath = path.join(currentDir, 'cms.config.tsx');

    if (fs.existsSync(cmsConfigPath)) {
      return path.join(currentDir, location);
    }

    // Move up one directory
    currentDir = path.dirname(currentDir);
  }

  // If we can't find a workspace root, return the current directory
  console.warn(
    chalk.yellow(
      'Could not find pnpm-workspace.yaml. Using current directory.',
    ),
  );

  // Join paths and ensure no trailing slash
  const finalPath = path.join(process.cwd(), location);
  return finalPath.endsWith('/') ? finalPath.slice(0, -1) : finalPath;
};
