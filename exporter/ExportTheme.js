
import fs from 'node:fs';
import path from 'node:path';

import { validateTheme } from './ValidateTheme.js';


function countHtmlFiles(directory) {
  if (!fs.existsSync(directory)) {
    return 0;
  }

  let count = 0;

  for (const entry of fs.readdirSync(directory, {
    withFileTypes: true
  })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      count += countHtmlFiles(fullPath);
    } else if (
      entry.isFile() &&
      path.extname(entry.name).toLowerCase() === '.html'
    ) {
      count++;
    }
  }

  return count;
}

export function exportTheme({
  projectRoot = process.cwd(),
  themeName,
  buildDirectory = 'dist',
  exportDirectory = 'exports'
}) {
  if (!themeName ||
      !/^[A-Za-z][A-Za-z0-9_-]*$/.test(themeName)) {
    throw new Error('LifeTechOCMS: Invalid theme name.');
  }

  const root = path.resolve(projectRoot);
  const source = path.resolve(root, buildDirectory);
  const exportRoot = path.resolve(root, exportDirectory);
  const destination = path.join(exportRoot, themeName);

  // Protect the source build and project directories.
  if (source === root ||
      exportRoot === root ||
      destination === source ||
      destination.startsWith(source + path.sep) ||
      source.startsWith(destination + path.sep)) {
    throw new Error(
      'LifeTechOCMS: Unsafe build or export directory.'
    );
  }

  const resources = validateTheme(source);

  fs.mkdirSync(exportRoot, { recursive: true });

  // Use a temporary directory so an incomplete copy does not
  // replace an existing export.
  const temporary = fs.mkdtempSync(
    path.join(exportRoot, '.lifetech-export-')
  );

  try {
    // Copy generated LifeTechOCMS Theme directories
    for (const folder of ['Assets', 'Layouts', 'Views', 'Storage']) {

        const sourceFolder = path.join(source, folder);
        const destinationFolder = path.join(temporary, folder);

        // Skip directories that do not exist
        if (!fs.existsSync(sourceFolder)) {
            continue;
        }

        fs.cpSync(
            sourceFolder,
            destinationFolder,
            { recursive: true }
        );
    }

    // Preserve any existing export until the copy is complete.
    const backup = destination + '.backup';

    if (fs.existsSync(backup)) {
      throw new Error(
        `Remove or rename the existing backup first: ${backup}`
      );
    }

    const hadExisting = fs.existsSync(destination);

    if (hadExisting) {
      fs.renameSync(destination, backup);
    }

    try {
        //console.log('[LifeTechOCMS] Temporary:', temporary);
        //console.log('[LifeTechOCMS] Destination:', destination);

        console.log(
            '[LifeTechOCMS] Temporary exists:',
            fs.existsSync(temporary)
        );

        console.log(
            '[LifeTechOCMS] Destination exists:',
            fs.existsSync(destination)
        );

        console.log(
            '[LifeTechOCMS] Temporary contents:',
            fs.readdirSync(temporary)
        );

        fs.renameSync(temporary, destination);

        } catch (error) {
        console.error('[LifeTechOCMS] Rename error:', {
            code: error.code,
            syscall: error.syscall,
            path: error.path,
            dest: error.dest
        });

        if (hadExisting && fs.existsSync(backup)) {
            fs.renameSync(backup, destination);
        }

        throw error;
    }

    if (hadExisting) {
      fs.rmSync(backup, { recursive: true, force: true });
    }

    console.log(
      `[LifeTechOCMS] Exported theme: ${destination}`
    );
   console.log(
    `[LifeTechOCMS] Layouts: ${
        countHtmlFiles(path.join(destination, 'Layouts'))
    }`
    );

    console.log(
    `[LifeTechOCMS] Views: ${
        countHtmlFiles(path.join(destination, 'Views'))
    }`
    );

    return destination;
  }finally {
        if (fs.existsSync(temporary)) {
        fs.rmSync(temporary, { recursive: true, force: true });
        }
    }
  
  
  
    
}
