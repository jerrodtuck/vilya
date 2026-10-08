import fs from 'node:fs';
import path from 'node:path';
export const cleanRelative = value => {
  if (typeof value !== 'string' || value.includes('\\') || value.includes(':') || value.includes('\0') || value.startsWith('/') || value.split('/').some(part => !part || part === '.' || part === '..')) throw Error('Invalid patch path');
  return value;
};
export function safeFile(root, relative) {
  cleanRelative(relative); const base = fs.realpathSync(root); const file = path.resolve(base, relative);
  if (!file.startsWith(base + path.sep)) throw Error('Path escapes fixture');
  let current = base;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if (fs.existsSync(current) && fs.lstatSync(current).isSymbolicLink()) throw Error('Symlink patch escape');
  }
  return file;
}
