// main.ts — The Midnight Vault's hand-in program.
//
// Copies game/ and screenshots/ from this repository to the output
// directory and writes /output/dossier.json with buildDossier from
// vendor/makefun-game.ts, the kit's library, unchanged.
//
// Node 22, standard library only, no network. Outside the grader,
// MAKEFUN_OUTPUT_DIR stands in for /output; the grader sets /output
// itself. Runs twice, both runs byte-identical: the copy is a plain
// file copy and the dossier is deterministic over the same tree.

import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR
  ? resolve(process.env.MAKEFUN_OUTPUT_DIR)
  : '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'game'), join(outDir, 'game'), { recursive: true });
cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });

writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  })
);
