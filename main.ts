// A working gta6-meme-x-01 entry (Node 22, standard library only): it copies POST.json from the repository root to
// /output/POST.json, where the gate reads it. That is all the program has to do. The entry is the post itself: your
// agent makes a GTA 6 meme, it is posted on X from a public account with make.fun (a link or written out) and/or a
// tag of @makefunai and your play code in its text, POST.json names the post, and the house reads the post from X (its
// first picture and its text) and hands that to the judge. Nothing this program writes about the post is judged.
//
// Before copying, the program validates POST.json: it must name a real X post — a "url" field that is an
// https://x.com/ or https://twitter.com/ status address. A placeholder or a non-X address is refused here with a
// clear error instead of being passed on to the gate.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message: string): never {
  console.error(`POST.json is not a valid X post address: ${message}`);
  process.exit(1);
}

const postPath = join(BOT_DIR, 'POST.json');

let post: unknown;
try {
  post = JSON.parse(readFileSync(postPath, 'utf8'));
} catch (err) {
  fail(`could not be read or parsed (${(err as Error).message})`);
}

const rawUrl = (post as { url?: unknown } | null)?.url;
if (typeof rawUrl !== 'string' || rawUrl.trim().length === 0) {
  fail('missing "url" field — POST.json must name the post with a "url" field');
}
const url = rawUrl.trim();

let parsed: URL;
try {
  parsed = new URL(url);
} catch {
  fail(`"url" is not a valid URL: ${url}`);
}

if (
  parsed.protocol !== 'https:' ||
  (parsed.hostname !== 'x.com' &&
    parsed.hostname !== 'twitter.com' &&
    parsed.hostname !== 'www.x.com' &&
    parsed.hostname !== 'www.twitter.com') ||
  !/\/status\/\d+/.test(parsed.pathname)
) {
  fail(`"url" must be an https://x.com/ or https://twitter.com/ status address, got: ${url}`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(postPath, join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
