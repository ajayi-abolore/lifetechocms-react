
import fs from 'node:fs';
import path from 'node:path';

import {
  discoverReactFiles,
  getRelativeName
} from './GenerateEntries.js';

export function discoverLayouts(
  projectRoot,
  layoutsDirectory = 'src/Layouts'
) {
  const directory = path.resolve(
    projectRoot,
    layoutsDirectory
  );

  // Layouts are optional.
  if (!fs.existsSync(directory)) {
    return {};
  }

  if (!fs.statSync(directory).isDirectory()) {
    throw new Error(
      `LifeTechOCMS: Expected a directory: ${directory}`
    );
  }

  const layouts = {};
  const usedNames = new Set();

  // Discover supported files recursively.
  const layoutFiles = discoverReactFiles(directory);

  for (const file of layoutFiles) {
    // Example:
    // Admin/Dashboard.tsx -> Admin/Dashboard
    const name = getRelativeName(directory, file);

    const collisionKey = name.toLowerCase();

    if (usedNames.has(collisionKey)) {
      throw new Error(
        `LifeTechOCMS: Duplicate Layout name: ${name}`
      );
    }

    usedNames.add(collisionKey);

    layouts[name] = file;
  }

  return layouts;
}
