import fs from 'fs';
import os from 'os';
import path from 'path';

/** Дополнительные каталоги для PATH (GUI-приложения без login shell). */
export function collectPathEntries(
  platform: NodeJS.Platform,
  homeDir: string,
  etcPaths: string[] = [],
): string[] {
  if (platform === 'darwin') {
    return [
      '/usr/local/bin',
      '/opt/homebrew/bin',
      '/opt/homebrew/sbin',
      '/usr/local/sbin',
      path.join(homeDir, '.docker', 'bin'),
      '/Applications/Docker.app/Contents/Resources/bin',
      path.join(homeDir, '.local', 'bin'),
      ...etcPaths,
    ];
  }

  if (platform === 'linux') {
    return [
      '/usr/local/bin',
      '/usr/bin',
      '/bin',
      '/snap/bin',
      path.join(homeDir, '.docker', 'bin'),
      path.join(homeDir, '.local', 'bin'),
    ];
  }

  return [];
}

/** extras в начале, без дубликатов. */
export function mergePath(currentPath: string | undefined, extras: string[]): string {
  const seen = new Set<string>();
  const result: string[] = [];

  const add = (entry: string) => {
    const trimmed = entry.trim();
    if (!trimmed || seen.has(trimmed)) {
      return;
    }
    seen.add(trimmed);
    result.push(trimmed);
  };

  for (const entry of extras) {
    add(entry);
  }

  if (currentPath) {
    for (const entry of currentPath.split(path.delimiter)) {
      add(entry);
    }
  }

  return result.join(path.delimiter);
}

/** Читает строки пути из файла (пропуск пустых и комментариев). */
function readPathLines(filePath: string): string[] {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'));
  } catch {
    return [];
  }
}

/** Системные пути macOS из /etc/paths и /etc/paths.d. */
function readDarwinEtcPaths(): string[] {
  const entries: string[] = [];
  entries.push(...readPathLines('/etc/paths'));

  try {
    const dirEntries = fs.readdirSync('/etc/paths.d');
    for (const name of dirEntries) {
      entries.push(...readPathLines(path.join('/etc/paths.d', name)));
    }
  } catch {
    // каталога может не быть
  }

  return entries;
}

/** Расширяет process.env.PATH до spawn дочерних процессов. */
export function augmentProcessPath(): void {
  if (process.platform === 'win32') {
    return;
  }

  const etcPaths = process.platform === 'darwin' ? readDarwinEtcPaths() : [];
  const extras = collectPathEntries(process.platform, os.homedir(), etcPaths);
  process.env.PATH = mergePath(process.env.PATH, extras);
}
