
import { exportTheme } from './ExportTheme.js';

export { exportTheme } from './ExportTheme.js';
export { validateTheme } from './ValidateTheme.js';

export function runExport(options = {}) {
  return exportTheme(options);
}
