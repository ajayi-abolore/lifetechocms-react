
import fs from 'node:fs';
import path from 'node:path';

const SUPPORTED_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx'
]);

const normalize = file => file.replace(/\\/g, '/');

// Recursively discover supported React files.
export function discoverReactFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const files = [];

  function walk(currentDirectory) {
    const entries = fs.readdirSync(currentDirectory, {
      withFileTypes: true
    });

    for (const entry of entries) {
      const fullPath = path.join(
        currentDirectory,
        entry.name
      );

      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (
        entry.isFile() &&
        SUPPORTED_EXTENSIONS.has(
          path.extname(entry.name).toLowerCase()
        )
      ) {
        files.push(fullPath);
      }
    }
  }

  walk(directory);

  return files.sort();
}

// Convert a file into its relative component name.
// Example: Blog/Details.tsx -> Blog/Details
export function getRelativeName(baseDirectory, file) {
  const relative = normalize(
    path.relative(baseDirectory, file)
  );

  return relative.replace(/\.(jsx?|tsx?)$/i, '');
}

// Create a unique Vite entry name.
export function getEntryName(type, relativeName) {
  const normalized = relativeName
    .replace(/\\/g, '/')
    .replace(/\//g, '_');

  return `${type}_${normalized}`;
}

export function generateEntries(
  layouts,
  pluginRoot,
  projectRoot,
  viewsDirectory = 'src/Views'
) {
  const entries = {};
  const modules = {};

  const layoutRuntime = normalize(
    path.resolve(
      pluginRoot,
      'runtime/LifeTechEntry.jsx'
    )
  );

  const viewRuntime = normalize(
    path.resolve(
      pluginRoot,
      'runtime/LifeTechViewEntry.jsx'
    )
  );

  // Layouts are supplied by discoverLayouts().
  // Their keys must represent relative paths,
  // e.g. Admin/Dashboard.
  for (const [name, layoutPath] of Object.entries(layouts)) {
    const entryName = getEntryName('Layout', name);
    const resolvedId =
      `\0virtual:lifetech-layout-${entryName}`;

    entries[entryName] = resolvedId;

    modules[resolvedId] = `
      import Layout from ${JSON.stringify(
        normalize(layoutPath)
      )};

      import { mountLifeTechLayout } from
        ${JSON.stringify(layoutRuntime)};

      mountLifeTechLayout(Layout);
    `;
  }

  // Discover Views recursively.
  const viewsPath = path.resolve(
    projectRoot,
    viewsDirectory
  );

  if (!fs.existsSync(viewsPath)) {
    throw new Error(
      'LifeTechOCMS: Views directory not found: ' +
      viewsPath
    );
  }
  if (!fs.statSync(viewsPath).isDirectory()) {
    throw new Error(
      `LifeTechOCMS: Expected a Views directory: ${viewsPath}`
    );
  }

  const viewFiles = discoverReactFiles(viewsPath);

  // Prevent ambiguous names such as Home.jsx and Home.tsx
  // within the same directory.
  const usedNames = new Set();

  for (const file of viewFiles) {
    const relativeName = getRelativeName(
      viewsPath,
      file
    );

    const collisionKey = relativeName.toLowerCase();

    if (usedNames.has(collisionKey)) {
      throw new Error(
        `LifeTechOCMS: Duplicate View name: ${relativeName}`
      );
    }

    usedNames.add(collisionKey);

    const entryName = getEntryName(
      'View',
      relativeName
    );

    const resolvedId =
      `\0virtual:lifetech-view-${entryName}`;

    entries[entryName] = resolvedId;

    modules[resolvedId] = `
      // LifeTechOCMS View: ${relativeName}
      // Source: ${normalize(file)}
      //
      // This View must provide a default export.
      //
      // Example:
      // export default function Home() {
      //   return <h1>Welcome</h1>;
      // }

      import View from ${JSON.stringify(
        normalize(file)
      )};

      import { mountLifeTechView } from
        ${JSON.stringify(viewRuntime)};

      document
        .querySelectorAll(
          ${JSON.stringify(
            `[data-lt-view="${relativeName}"]`
          )}
        )
        .forEach(element => {
          mountLifeTechView(element, View);
        });
    `;

  }

  return {
    entries,
    modules
  };
}
