#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { build } from 'vite';
import { exportTheme } from '../exporter/index.js';

const projectRoot = process.cwd();
const buildDirectory = 'dist-lifetech';

async function main() {
  try {
    console.log('[LifeTechOCMS] Starting theme build...');

    // Activate LifeTech build mode.
    process.env.LIFETECH_BUILD = 'true';

    // Run Vite build automatically.
    await build({
      root: projectRoot,
      build: {
        outDir: buildDirectory,
        emptyOutDir: true
      }
    });

    const metadataPath = path.join(
      projectRoot,
      buildDirectory,
      'lifetech-theme.json'
    );

    if (!fs.existsSync(metadataPath)) {
      throw new Error(
        'Theme metadata was not generated.'
      );
    }

    const metadata = JSON.parse(
      fs.readFileSync(metadataPath, 'utf8')
    );

    if (!metadata.themeName) {
      throw new Error(
        'Theme name is missing from build metadata.'
      );
    }

    exportTheme({
      projectRoot,
      themeName: metadata.themeName,
      buildDirectory,
      exportDirectory: 'lt-exports'
    });

    console.log(
      '[LifeTechOCMS] Theme export completed.'
    );
  } catch (error) {
    console.error(
      '[LifeTechOCMS] Export failed:',
      error.message
    );

    process.exitCode = 1;
  }
}

await main();
