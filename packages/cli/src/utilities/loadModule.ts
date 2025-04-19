import { createJiti } from 'jiti';
const jiti = createJiti(import.meta.url, {
  // Transpilation cache, can be safely enabled
  cache: true,
  // Bypass Node.js runtime require cache
  // Same as "import-fresh" package we used previously
  requireCache: false,
  jsx: true,
});

export async function loadModule(modulePath: string): Promise<unknown> {
  try {
    if (typeof modulePath !== 'string') {
      throw new Error(`Invalid module path of type name=${modulePath}`);
    }

    const load = await jiti.import(modulePath);
    return load;
  } catch (error) {
    console.log(error);
    throw new Error('Failed to load module');
  }
}
