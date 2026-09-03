import { cp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const basePath = (process.env.GITHUB_PAGES_BASE_PATH ?? '/jonaks-beauty').replace(/\/$/, '');
const origin = process.env.GITHUB_PAGES_ORIGIN ?? 'https://olawale-bello.github.io';
if (basePath && !/^\/[A-Za-z0-9._-]+$/.test(basePath)) throw new Error('Invalid GitHub Pages base path');
if (new URL(origin).protocol !== 'https:') throw new Error('GitHub Pages origin must use HTTPS');

// Rebuild only these dedicated, ignored directories inside this project.
async function resetBuildDirectory(name) {
  if (!['.github-pages-build', 'github-pages'].includes(name)) throw new Error('Unexpected build directory');
  const target = resolve(projectRoot, name);
  if (dirname(target) !== projectRoot) throw new Error('Build path must stay inside the project');
  await rm(target, { recursive: true, force: true });
  await mkdir(target, { recursive: true });
  return target;
}
const staging = await resetBuildDirectory('.github-pages-build');
const output = await resetBuildDirectory('github-pages');

for (const name of ['app', 'components', 'hooks', 'lib', 'public', 'package.json', 'package-lock.json', 'postcss.config.mjs']) {
  await cp(join(projectRoot, name), join(staging, name), { recursive: true });
}
await symlink(join(projectRoot, 'node_modules'), join(staging, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');

// Native anchors and public asset URLs need the repository prefix on Pages.
// Transform the temporary export source, preserving the existing Sites source.
async function adaptSource(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await adaptSource(path);
    else if (/\.(tsx?|jsx?|css)$/.test(entry.name)) {
      let source = await readFile(path, 'utf8');
      source = source.replace(/(["'`])\/(?![/>])/g, `$1${basePath}/`);
      source = source.replaceAll('https://jonaks-beauty-premium.dejigraphicz.chatgpt.site', origin);
      await writeFile(path, source);
    }
  }
}
await adaptSource(join(staging, 'app'));
await adaptSource(join(staging, 'lib'));

await writeFile(join(staging, 'next.config.mjs'), `export default ${JSON.stringify({
  output: 'export', basePath, trailingSlash: true, images: { unoptimized: true },
  outputFileTracingRoot: staging,
})};\n`);
const tsconfig = JSON.parse(await readFile(join(projectRoot, 'tsconfig.json'), 'utf8'));
tsconfig.include = ['next-env.d.ts', 'app/**/*.ts', 'app/**/*.tsx', 'components/**/*.tsx', 'hooks/**/*.ts', 'lib/**/*', '.next/types/**/*.ts'];
tsconfig.exclude = ['node_modules'];
await writeFile(join(staging, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2) + '\n');

const result = spawnSync(process.execPath, [join(projectRoot, 'node_modules/next/dist/bin/next'), 'build', '--webpack'], {
  cwd: staging, stdio: 'inherit', env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1' },
});
if (result.status !== 0) throw new Error(`GitHub Pages build failed: ${result.error ?? result.status}`);
await cp(join(staging, 'out'), output, { recursive: true });
await writeFile(join(output, '.nojekyll'), '');
console.log(`GitHub Pages files ready in ${output}`);
