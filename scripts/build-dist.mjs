import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');

if (path.dirname(output) !== root || path.basename(output) !== 'dist') {
  throw new Error(`Refusing to replace unexpected output directory: ${output}`);
}

const files = [
  '404.html',
  'apple-touch-icon.png',
  'discover.html',
  'favicon.ico',
  'icon-192.png',
  'icon-512.png',
  'imprint.html',
  'index.html',
  'privacy.html',
  'robots.txt',
  'site.webmanifest',
  'sitemap.xml'
];
const directories = ['assets', 'css', 'js', 'media'];
const isPublicSource = (source) => path.relative(root, source)
  .split(path.sep)
  .every((segment) => segment && !segment.startsWith('.'));

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

await Promise.all([
  ...files.map((file) => cp(path.join(root, file), path.join(output, file))),
  ...directories.map((directory) => cp(
    path.join(root, directory),
    path.join(output, directory),
    { recursive: true, filter: isPublicSource }
  ))
]);

const removeMetadata = async (directory) => {
  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name);
    if (entry.name.startsWith('.')) {
      await rm(target, { recursive: true, force: true });
    } else if (entry.isDirectory()) {
      await removeMetadata(target);
    }
  }));
};

await removeMetadata(output);
const built = await readdir(output);
console.log(`Built ${built.length} production entries in ${path.relative(root, output)}/.`);
