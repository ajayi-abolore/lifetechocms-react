
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

// Find a resource recursively using its filename.
function findResource(directory, fileName) {
  if (!fs.existsSync(directory)) {
    return null;
  }

  const matches = [];

  function scan(currentDirectory) {
    for (const entry of fs.readdirSync(currentDirectory, {
      withFileTypes: true
    })) {
      const fullPath = path.join(
        currentDirectory,
        entry.name
      );

      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (
        entry.isFile() &&
        entry.name.toLowerCase() === fileName.toLowerCase()
      ) {
        matches.push(fullPath);
      }
    }
  }

  scan(directory);

  if (matches.length > 1) {
    throw new Error(
      `LifeTechOCMS: Duplicate resource filename: ${fileName}`
    );
  }

  return matches[0] ?? null;
}

export async function generateLayoutMapping({
  projectRoot,
  outputDirectory,
  themeName,
  mappingFile = 'src/LayoutMapping.js'
}) {
  const sourcePath = path.resolve(
    projectRoot,
    mappingFile
  );

  if (!fs.existsSync(sourcePath)) {
    console.log(
      '[LifeTechOCMS] No Layout Mapping found.'
    );
    return;
  }

  const { default: mapping } = await import(
    pathToFileURL(sourcePath).href
  );

  if (
    !mapping ||
    typeof mapping !== 'object' ||
    Array.isArray(mapping)
  ) {
    throw new Error(
      'LifeTechOCMS: Invalid Layout Mapping.'
    );
  }

  const layoutsDirectory = path.join(
    outputDirectory,
    'Layouts'
  );

  const viewsDirectory = path.join(
    outputDirectory,
    'Views'
  );

  const pendingLayouts = [];
  const assignedViews = new Set();

  // Accept resource filenames only.
  function getHtmlFileName(name, type) {
    if (
      typeof name !== 'string' ||
      !/^[A-Za-z0-9_-]+(?:\.html)?$/i.test(name)
    ) {
      throw new Error(
        `LifeTechOCMS: Invalid ${type} filename: ${name}`
      );
    }

    return name.toLowerCase().endsWith('.html')
      ? name
      : `${name}.html`;
  }

  for (const [layoutName, viewNames] of Object.entries(mapping)) {
    const layoutFile = getHtmlFileName(
      layoutName,
      'Layout'
    );

    if (!findResource(layoutsDirectory, layoutFile)) {
      throw new Error(
        `LifeTechOCMS: Layout not found: ${layoutFile}`
      );
    }

    if (!Array.isArray(viewNames)) {
      throw new Error(
        `LifeTechOCMS: Expected an array of Views for ${layoutName}`
      );
    }

    for (const viewName of viewNames) {
      const viewFile = getHtmlFileName(
        viewName,
        'View'
      );

      if (!findResource(viewsDirectory, viewFile)) {
        throw new Error(
          `LifeTechOCMS: View not found: ${viewFile}`
        );
      }

      const assignmentKey = viewFile.toLowerCase();

      if (assignedViews.has(assignmentKey)) {
        throw new Error(
          `LifeTechOCMS: View assigned more than once: ${viewFile}`
        );
      }

      assignedViews.add(assignmentKey);

      pendingLayouts.push({
        layoutName: layoutFile,
        contentName: viewFile,
        layoutPackageName: themeName
      });
    }
  }

  const destination = path.join(
    outputDirectory,
    'Storage',
    'Layouts',
    'PendingLayouts.json'
  );

  fs.mkdirSync(
    path.dirname(destination),
    { recursive: true }
  );

  fs.writeFileSync(
    destination,
    JSON.stringify(pendingLayouts, null, 2) + '\n',
    'utf8'
  );

  console.log(
    `[LifeTechOCMS] Generated ${pendingLayouts.length} Layout mappings.`
  );
}
