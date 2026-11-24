import fs from 'node:fs';
import path from 'node:path';

export function generateThemeMetadata({
  outputDirectory,
  themeName
}) {
  const metadata = {
    themeName
  };

  fs.mkdirSync(outputDirectory, {
    recursive: true
  });

  const destination = path.join(
    outputDirectory,
    'lifetech-theme.json'
  );

  fs.writeFileSync(
    destination,
    JSON.stringify(metadata, null, 2) + '\n',
    'utf8'
  );

  console.log(
    `[LifeTechOCMS] Generated Theme metadata: ${themeName}`
  );
}