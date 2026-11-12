import { access, cp, mkdir, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, runInContext } from 'node:vm';

const project = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const output = join(project, 'dist');
const catalog = join(project, 'assets', 'js', 'catalog.js');
const context = createContext({ Date, Intl });
runInContext(await readFile(catalog, 'utf8'), context, { filename: catalog });

const { date, id } = context.Carnival.featuredAt(new Date());
if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || typeof id !== 'string' || !id) {
  throw new Error('The catalogue must return a featured game id and an ISO calendar date.');
}

const publicPaths = [
  'index.html', 'play.html', 'embed.html', 'LICENCE.md', 'robots.txt', 'sitemap.xml',
  '.nojekyll', 'assets', 'games',
];
await Promise.all(publicPaths.map(path => access(join(project, path))));

// Keep builds repeatable and reject a dist link that points outside this project.
const resolvedOutput = await realpath(output).catch(error => {
  if (error.code !== 'ENOENT') throw error;
  return output;
});
if (resolvedOutput !== output) throw new Error('dist must be a directory inside the project.');
await rm(output, { recursive: true, force: true });
await mkdir(output);
await Promise.all(publicPaths.map(path => cp(join(project, path), join(output, path), { recursive: true })));
await writeFile(join(output, 'assets', 'js', 'featured.js'), `globalThis.CARNIVAL_FEATURED = ${JSON.stringify({ date, id })};\n`);
console.log(`Built dist with ${id} featured for ${date}.`);
