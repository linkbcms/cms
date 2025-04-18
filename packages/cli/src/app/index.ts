import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import chalk from 'chalk';
import os from 'node:os';

/**
 * Creates a new linkb application by cloning the template repository
 * and excluding the packages folder
 *
 * @param appName - The name of the application to create
 * @param options - Additional options for app creation
 */
export async function createApp(
  appName: string,
  options: {
    template?: string;
    packageManager?: 'npm' | 'yarn' | 'pnpm';
  } = {},
) {
  const { template = 'basic', packageManager = detectPackageManager() } =
    options;

  const repositoryUrl = 'https://github.com/linkb15/cms';

  // Validate app name
  if (!appName) {
    console.error(chalk.red('Please specify an application name'));
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), appName);

  // Check if directory already exists
  if (fs.existsSync(targetDir)) {
    console.error(chalk.red(`Directory ${appName} already exists`));
    process.exit(1);
  }

  console.log(
    chalk.blue(
      `Creating a new linkb app in ${chalk.bold(targetDir)} using ${chalk.bold(template)} template`,
    ),
  );

  try {
    // Clone the repository
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'linkb-clone-'));
    console.log(chalk.blue('Cloning repository...'));
    execSync(`git clone --depth=1 ${repositoryUrl} ${tempDir}`, {
      stdio: 'inherit',
    });

    // Check if the requested template exists
    const templateDir = path.join(tempDir, 'template', template);
    if (!fs.existsSync(templateDir)) {
      console.error(chalk.red(`Template "${template}" not found`));
      fs.rmSync(tempDir, { recursive: true, force: true });
      process.exit(1);
    }

    // Create the target directory
    fs.mkdirSync(targetDir, { recursive: true });

    // Copy template files to the target directory
    console.log(chalk.blue(`Copying ${template} template files...`));

    // Use a cross-platform way to copy directory contents
    fs.cpSync(templateDir, targetDir, { recursive: true });

    // Update package.json with app name
    const packageJsonPath = path.join(targetDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      packageJson.name = appName;
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    // Initialize git repository
    console.log(chalk.blue('Initializing git repository...'));
    execSync('git init', {
      cwd: targetDir,
      stdio: 'inherit',
    });
    execSync('git add .', {
      cwd: targetDir,
      stdio: 'inherit',
    });
    execSync('git commit -m "Initial commit"', {
      cwd: targetDir,
      stdio: 'inherit',
    });

    // Install dependencies
    console.log(
      chalk.blue(`Installing dependencies using ${packageManager}...`),
    );
    const installCmd = getInstallCommand(packageManager);

    execSync(installCmd, {
      cwd: targetDir,
      stdio: 'inherit',
    });

    console.log(chalk.green('✅ Dependencies installed successfully!'));

    // Clean up temporary directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    // Copy .env.example to .env if it exists
    const envExamplePath = path.join(targetDir, '.env.example');
    const envPath = path.join(targetDir, '.env');
    if (fs.existsSync(envExamplePath)) {
      console.log(chalk.blue('Setting up environment file...'));
      fs.copyFileSync(envExamplePath, envPath);
      console.log(chalk.green('✅ Created .env file from .env.example'));
    }

    console.log(chalk.green('✅ Successfully created app!'));
    console.log('');
    console.log(chalk.blue('Next steps:'));
    console.log(`  cd ${appName}`);
    console.log(`  ${getDevCommand(packageManager)}`);
  } catch (error) {
    console.error(chalk.red('Failed to create app:'), error);

    // Cleanup on failure
    if (fs.existsSync(targetDir)) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }

    process.exit(1);
  }
}

/**
 * Detects which package manager is being used to run the command
 * Returns pnpm, yarn, or npm (default)
 */
function detectPackageManager(): 'npm' | 'yarn' | 'pnpm' {
  const userAgent = process.env.npm_config_user_agent;

  if (userAgent) {
    if (userAgent.includes('pnpm')) return 'pnpm';
    if (userAgent.includes('yarn')) return 'yarn';
  }

  // Check if package managers are installed
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return 'pnpm';
  } catch (e) {
    try {
      execSync('yarn --version', { stdio: 'ignore' });
      return 'yarn';
    } catch (e) {
      return 'npm';
    }
  }
}

/**
 * Gets the install command for the specified package manager
 */
function getInstallCommand(packageManager: string): string {
  switch (packageManager) {
    case 'yarn':
      return 'yarn';
    case 'pnpm':
      return 'pnpm install';
    default:
      return 'npm install';
  }
}

/**
 * Gets the dev command for the specified package manager
 */
function getDevCommand(packageManager: string): string {
  switch (packageManager) {
    case 'yarn':
      return 'yarn dev';
    case 'pnpm':
      return 'pnpm dev';
    default:
      return 'npm run dev';
  }
}
