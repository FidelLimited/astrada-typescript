// Writes the files for developers' AI agents next to the TypeDoc site (npm run docs:api, which the
// public repository's reference workflow runs, so this file is part of the public export):
//   api-docs/llms.txt          the llmstxt.org index: what the SDK is, then links to markdown pages
//   api-docs/md/guide/*.md     an Overview page (the README's introduction) and one page per README
//                              section; a link to a README heading points at the page holding it,
//                              and a relative link at the file in the public repository on GitHub
//   api-docs/llms-full.txt     every linked page in one file
// The API reference pages (api-docs/md/reference) come from the same TypeDoc options as the HTML
// (typedoc.json), with typedoc-plugin-markdown: the module pages and classes are listed under
// "API reference", and every interface (the models and request arguments), function, type alias
// and variable under "Optional" (not the generated JSON converters and type guards).
// It fails when a link in llms.txt, a guide page or a reference page points at a page or file
// that does not exist, or when the guides, modules or classes come out empty (a changed README or
// plugin layout).
//   LLMS_BASE_URL   where the site is served (default https://fidellimited.github.io/astrada-typescript/)
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

const site = process.argv[2] ?? 'api-docs';
const readme = process.argv[3] ?? 'README.md';
const base = (process.env.LLMS_BASE_URL ?? 'https://fidellimited.github.io/astrada-typescript/').replace(/\/?$/, '/');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const problems = [];

// The introduction (before the first "## ") and the sections, split outside code fences. Every
// heading's GitHub anchor is kept with the section that holds it (-1 for the introduction).
const intro = [];
const sections = [];
const anchors = new Map();
const ghAnchor = (title) => title.toLowerCase().replace(/[^\p{L}\p{N} _-]/gu, '').replace(/ /g, '-');
let current = null;
let fenced = false;
for (const line of readFileSync(readme, 'utf8').split('\n')) {
  if (/^```/.test(line)) fenced = !fenced;
  const heading = !fenced && /^(#{2,6}) (.+)$/.exec(line);
  if (heading && heading[1] === '##') {
    current = { title: heading[2].trim(), lines: [] };
    sections.push(current);
  }
  if (heading) anchors.set(ghAnchor(heading[2].trim()), sections.length - 1);
  if (heading && heading[1] === '##') continue;
  if (current) current.lines.push(line);
  else if (!/^# /.test(line)) intro.push(line);
}
const slug = (title) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const skip = new Set(['support', 'license']);
const kept = sections.filter((s) => !skip.has(slug(s.title)));
const pagePath = new Map(kept.map((s) => [s, `md/guide/${slug(s.title)}.md`]));
const login = [...pagePath].find(([s]) => slug(s.title) === 'choose-the-environment-and-log-in')?.[1];
// The public repository on GitHub, where the README's relative links (docs/, CHANGELOG.md) live.
const repoBlob = `${String(pkg.repository?.url ?? pkg.repository ?? '').replace(/^git\+/, '').replace(/\.git$/, '')}/blob/main/`;
const readmeDir = dirname(readme);
const fixLinks = (text, page) => text.replace(/\]\(([^)\s]+)\)/g, (whole, target) => {
  if (/^[a-z]+:/i.test(target)) return whole;
  if (target.startsWith('#')) {
    const index = anchors.get(target.slice(1));
    if (index === undefined) {
      problems.push(`${page}: link to ${target} matches no README heading`);
      return whole;
    }
    if (index === -1) return `](${base}md/guide/overview.md)`;
    const path = pagePath.get(sections[index]);
    return `](${path ? `${base}${path}` : `${repoBlob}README.md${target}`})`;
  }
  const file = target.replace(/#.*$/, '').replace(/^\.\//, '');
  // In this private repository, public-repo/ holds the public repository's own root files, and the
  // export writes CHANGELOG.md; in the public repository they are all at the root.
  const found = file === 'CHANGELOG.md' || [readmeDir, join(readmeDir, 'public-repo')].some((d) => existsSync(join(d, file)));
  if (!found) problems.push(`${page}: links to ${file}, which is not in the repository`);
  return `](${repoBlob}${target.replace(/^\.\//, '')})`;
});

const guideDir = join(site, 'md', 'guide');
rmSync(guideDir, { recursive: true, force: true });
mkdirSync(guideDir, { recursive: true });
const guides = [{ title: 'Overview', path: 'md/guide/overview.md' }];
writeFileSync(join(site, guides[0].path), `# Overview\n\n${fixLinks(intro.join('\n').trim(), 'overview')}\n`);
for (const section of kept) {
  const name = slug(section.title);
  let body = fixLinks(section.lines.join('\n').trim(), name);
  // Pages whose examples import ./astrada.js say where it comes from.
  if (login && pagePath.get(section) !== login && body.includes("'./astrada.js'")) {
    body = `The examples import \`config\` from \`./astrada.js\`, shown in [Choose the environment and log in](${base}${login}).\n\n${body}`;
  }
  writeFileSync(join(site, pagePath.get(section)), `# ${section.title}\n\n${body}\n`);
  guides.push({ title: section.title, path: pagePath.get(section) });
}

// The reference: module pages and classes, then the rest (interfaces, functions, type aliases, variables).
const ref = join(site, 'md', 'reference');
if (!existsSync(ref)) {
  console.error(`llms: ${ref} is missing; run the markdown TypeDoc build first`);
  process.exit(1);
}
const modules = [];
const classes = [];
const others = [];
const KINDS = { classes: classes, interfaces: others, functions: others, 'type-aliases': others, variables: others, enumerations: others };
(function walk(dir, rel) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const childRel = `${rel}/${entry.name}`;
    if (entry.isDirectory()) {
      walk(join(dir, entry.name), childRel);
      continue;
    }
    const owner = rel.replace(/^md\/reference\/?/, '').replace(/\/(classes|interfaces|functions|type-aliases|variables|enumerations)$/, '').replace(/\/namespaces\//g, '.');
    const kind = /\/([a-z-]+)$/.exec(rel)?.[1];
    if (entry.name === 'README.md' && rel !== 'md/reference') modules.push({ title: owner, path: childRel });
    else if (KINDS[kind]) {
      const name = entry.name.replace(/\.md$/, '');
      // The generated JSON converters and type guards of each model (CardFromJSON, instanceOfCard ...)
      // are plumbing the SDK calls itself; the model's interface page is what a reader needs.
      if (kind === 'functions' && /^instanceOf|(From|To)JSON(Typed)?$/.test(name)) continue;
      const prefix = owner.replace(/^index(\.|$)/, '');
      KINDS[kind].push({ title: `${prefix ? `${prefix}.` : ''}${name}`, path: childRel, kind });
    }
  }
})(ref, 'md/reference');
for (const list of [modules, classes, others]) list.sort((a, b) => a.title.localeCompare(b.title));
if (guides.length < 2 || modules.length === 0 || classes.length === 0) {
  console.error(`llms: nothing to list (guides ${guides.length - 1}, modules ${modules.length}, classes ${classes.length}); has the README or plugin layout changed?`);
  process.exit(1);
}

const WRITTEN_LAST = new Set(['llms.txt', 'llms-full.txt']);
// Every link inside the generated pages must resolve: relative ones next to the page, ones under
// the base URL inside the site.
(function check(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) { check(path); continue; }
    if (!entry.name.endsWith('.md')) continue;
    for (const m of readFileSync(path, 'utf8').matchAll(/\]\(([^)\s]+)\)/g)) {
      const target = m[1].replace(/#.*$/, '');
      if (!target) continue;
      if (target.startsWith(base)) {
        // llms.txt and llms-full.txt are written after this check (the README links to both).
        const built = WRITTEN_LAST.has(target.slice(base.length)) || existsSync(join(site, target.slice(base.length)));
        if (!built) problems.push(`${path}: links to ${target}, which was not built`);
      } else if (!/^[a-z]+:/i.test(target) && !existsSync(normalize(join(dirname(path), target)))) {
        problems.push(`${path}: links to ${target}, which was not built`);
      }
    }
  }
})(join(site, 'md'));

const link = ({ title, path }, note) => `- [${title}](${base}${path})${note ? `: ${note}` : ''}`;
const llms = [
  `# ${pkg.name}`,
  '',
  `> The Astrada TypeScript SDK (\`npm install ${pkg.name}\`, Node.js 20 or later) is the backend client for the Astrada API: subaccounts, enrollment links, cards and card subscriptions, transactions and their messages, webhooks (verify, parse and replay), the Banking API and the sandbox simulations, with typed errors, retries and a mock for tests. It has no card-enrollment methods: card enrollment happens in the browser with the Unified Enrollment SDK v2 or an enrollment link. An approved direct-API partner that sends card data through \`RequestApi.send\` has it pass through its own server, in its own PCI scope.`,
  '',
  `Every page below is markdown generated from the same sources as the HTML reference at ${base} for version ${pkg.version} of the package.`,
  '',
  '## Guides',
  '',
  ...guides.map((g) => link(g)),
  '',
  '## API reference',
  '',
  ...modules.map((m) => link(m, 'every class, interface, function and type of this module')),
  ...classes.map((c) => link(c)),
  '',
  '## Astrada documentation',
  '',
  '- [Astrada docs for AI agents](https://docs.astrada.co/llms.txt): the whole API documentation as an llms.txt index',
  '- [Backend SDKs](https://docs.astrada.co/docs/backend-sdks): how the TypeScript, Python and Java SDKs fit with the API',
  '',
  '## Optional',
  '',
  'The models, request arguments, functions and types, one page each:',
  '',
  ...others.map((o) => link(o)),
  '',
];
writeFileSync(join(site, 'llms.txt'), llms.join('\n'));

const pages = [];
for (const m of llms.join('\n').matchAll(/\]\((\S+?)\)/g)) {
  if (!m[1].startsWith(base)) continue;
  const path = m[1].slice(base.length);
  if (existsSync(join(site, path))) pages.push(path);
  else problems.push(`llms.txt: ${path} was not built`);
}
if (problems.length) {
  console.error(`llms: ${problems.length} broken links:\n  ${problems.slice(0, 50).join('\n  ')}`);
  process.exit(1);
}
const full = [llms.join('\n'), ...pages.map((path) => `\n\n---\n\nSource: ${base}${path}\n\n${readFileSync(join(site, path), 'utf8')}`)];
writeFileSync(join(site, 'llms-full.txt'), full.join(''));
console.log(`llms: ${guides.length} guide pages, ${modules.length} modules, ${classes.length} classes, ${others.length} other reference pages; ${pages.length} links checked`);
