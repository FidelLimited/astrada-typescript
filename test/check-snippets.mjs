#!/usr/bin/env node
// Type-checks every ```ts / ```typescript block in README.md and docs/**/*.md against the packed
// package, the way a new user would see it: `npm pack`, installed into a scratch project, then
// `tsc --noEmit` (strict, module nodenext, ES2022). Run after `npm run build`:
//   npm run test:snippets
//
// Each block is its own module. A block whose first line is `// file: NAME.ts` is written under that
// name, so the other blocks of the same page can import it (`import { config } from './NAME.js'`).
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync, symlinkSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const work = join(root, '.snippets-check');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

function markdownFiles() {
  const files = [join(root, 'README.md')];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name);
      if (statSync(path).isDirectory()) walk(path);
      else if (name.endsWith('.md')) files.push(path);
    }
  };
  walk(join(root, 'docs'));
  return files;
}

function blocks(text) {
  const found = [];
  const fence = /^```(ts|typescript)\s*\n([\s\S]*?)^```/gm;
  let match;
  while ((match = fence.exec(text)) !== null) {
    const line = text.slice(0, match.index).split('\n').length;
    found.push({ code: match[2], line });
  }
  return found;
}

rmSync(work, { recursive: true, force: true });
mkdirSync(join(work, 'node_modules', '@types'), { recursive: true });

// The package exactly as published.
execFileSync('npm', ['pack', '--silent', '--ignore-scripts', '--pack-destination', work], { cwd: root, stdio: ['ignore', 'pipe', 'inherit'] });
const tarball = readdirSync(work).find((name) => name.endsWith('.tgz'));
const target = join(work, 'node_modules', ...pkg.name.split('/'));
mkdirSync(target, { recursive: true });
execFileSync('tar', ['-xzf', join(work, tarball), '-C', target, '--strip-components=1']);
symlinkSync(join(root, 'node_modules', '@types', 'node'), join(work, 'node_modules', '@types', 'node'), 'dir');

const sources = [];
const where = new Map();
for (const file of markdownFiles()) {
  const page = relative(root, file).replace(/[^A-Za-z0-9]+/g, '_');
  blocks(readFileSync(file, 'utf8')).forEach(({ code, line }, index) => {
    const named = /^\/\/ file: ([A-Za-z0-9_-]+)\.ts\s*$/m.exec(code.split('\n')[0]);
    const name = named ? `${named[1]}.ts` : `snippet-${index + 1}.ts`;
    const path = join(work, 'src', page, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, code);
    sources.push(path);
    where.set(relative(work, path), `${relative(root, file)}:${line}`);
  });
}

writeFileSync(join(work, 'package.json'), JSON.stringify({ name: 'snippets', private: true, type: 'module' }));
writeFileSync(join(work, 'tsconfig.json'), JSON.stringify({
  compilerOptions: {
    strict: true,
    noEmit: true,
    target: 'ES2022',
    module: 'nodenext',
    moduleResolution: 'nodenext',
    lib: ['ES2022', 'DOM'],
    types: ['node'],
    skipLibCheck: false,
  },
  include: ['src/**/*.ts'],
}));

const tsc = join(root, 'node_modules', 'typescript', 'bin', 'tsc');
try {
  execFileSync(process.execPath, [tsc, '-p', work], { cwd: work, encoding: 'utf8' });
} catch (error) {
  // Point each error at the Markdown page and line it came from.
  const output = String(error.stdout || error.message).replace(/^(src\/[^(]+)\((\d+),(\d+)\)/gm, (all, file, l) => {
    const origin = where.get(file);
    return origin ? `${origin} (block line ${l})` : all;
  });
  console.error(output);
  console.error(`Snippet check failed (${sources.length} blocks).`);
  process.exit(1);
}
console.log(`${sources.length} snippets type-check against ${pkg.name}@${pkg.version}.`);
