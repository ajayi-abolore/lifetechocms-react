
import fs from 'node:fs';
import path from 'node:path';

// Discover HTML files recursively.
function discoverHtmlFiles(directory, root = directory) {
  const files = [];

  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true
  })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...discoverHtmlFiles(fullPath, root));
    } else if (
      entry.isFile() &&
      path.extname(entry.name).toLowerCase() === '.html'
    ) {
      const relativePath = path
        .relative(root, fullPath)
        .replace(/\\/g, '/');

      files.push(relativePath);
    }
  }

  return files.sort();
}

export function validateTheme(buildDirectory) {

  // 1. Confirm build directory exists.
  if (
    !fs.existsSync(buildDirectory) ||
    !fs.statSync(buildDirectory).isDirectory()
  ) {
    throw new Error(
      `LifeTechOCMS: Build directory not found: ${buildDirectory}`
    );
  }

  // 2. Validate required directories.
  for (const folder of ['Assets', 'Layouts', 'Views']) {
    const location = path.join(buildDirectory, folder);

    if (
      !fs.existsSync(location) ||
      !fs.statSync(location).isDirectory()
    ) {
      throw new Error(
        `LifeTechOCMS: Missing build folder: ${folder}`
      );
    }
  }

  // 3. Discover Layouts and Views recursively.
  const layouts = discoverHtmlFiles(
    path.join(buildDirectory, 'Layouts')
  );

  const views = discoverHtmlFiles(
    path.join(buildDirectory, 'Views')
  );

  // 4. Validate resource availability.
  if (layouts.length === 0) {
    throw new Error(
      'LifeTechOCMS: No Layout HTML files found.'
    );
  }

  if (views.length === 0) {
    throw new Error(
      'LifeTechOCMS: No View HTML files found.'
    );
  }

  // 5. Return discovered resources.
  return {
    layouts,
    views
  };
}
