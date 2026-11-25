#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { exportTheme } from '../exporter/index.js';

const projectRoot = process.cwd();
const buildDirectory = 'dist-lifetech';

// Resolve Vite from the consuming React application,
// rather than from the linked plugin's own directory.
async function loadProjectVite() {
  const requireFromProject = createRequire(
    path.join(projectRoot, 'package.json')
  );

  let viteEntry;

  try {
    viteEntry = requireFromProject.resolve('vite');
  } catch {
    throw new Error(
      'Vite could not be found in the React application.\n' +
      'Install Vite in your application using:\n' +
      'npm install -D vite'
    );
  }

  const vite = await import(
    pathToFileURL(viteEntry).href
  );

  if (typeof vite.build !== 'function') {
    throw new Error(
      'The installed Vite package does not expose a build function.'
    );
  }

  return vite.build;
}

async function main() {
  try {
    console.log('[LifeTechOCMS] Starting theme build...');

    // Activate LifeTech build mode.
    process.env.LIFETECH_BUILD = 'true';

    // Load Vite from the consuming project.
    const build = await loadProjectVite();

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

    await exportTheme({
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
