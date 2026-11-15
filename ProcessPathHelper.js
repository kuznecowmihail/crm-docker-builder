"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectPathEntries = collectPathEntries;
exports.mergePath = mergePath;
exports.augmentProcessPath = augmentProcessPath;
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
/** Дополнительные каталоги для PATH (GUI-приложения без login shell). */
function collectPathEntries(platform, homeDir, etcPaths = []) {
    if (platform === 'darwin') {
        return [
            '/usr/local/bin',
            '/opt/homebrew/bin',
            '/opt/homebrew/sbin',
            '/usr/local/sbin',
            path_1.default.join(homeDir, '.docker', 'bin'),
            '/Applications/Docker.app/Contents/Resources/bin',
            path_1.default.join(homeDir, '.local', 'bin'),
            ...etcPaths,
        ];
    }
    if (platform === 'linux') {
        return [
            '/usr/local/bin',
            '/usr/bin',
            '/bin',
            '/snap/bin',
            path_1.default.join(homeDir, '.docker', 'bin'),
            path_1.default.join(homeDir, '.local', 'bin'),
        ];
    }
    return [];
}
/** extras в начале, без дубликатов. */
function mergePath(currentPath, extras) {
    const seen = new Set();
    const result = [];
    const add = (entry) => {
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
        for (const entry of currentPath.split(path_1.default.delimiter)) {
            add(entry);
        }
    }
    return result.join(path_1.default.delimiter);
}
/** Читает строки пути из файла (пропуск пустых и комментариев). */
function readPathLines(filePath) {
    try {
        const content = fs_1.default.readFileSync(filePath, 'utf8');
        return content
            .split('\n')
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('#'));
    }
    catch {
        return [];
    }
}
/** Системные пути macOS из /etc/paths и /etc/paths.d. */
function readDarwinEtcPaths() {
    const entries = [];
    entries.push(...readPathLines('/etc/paths'));
    try {
        const dirEntries = fs_1.default.readdirSync('/etc/paths.d');
        for (const name of dirEntries) {
            entries.push(...readPathLines(path_1.default.join('/etc/paths.d', name)));
        }
    }
    catch {
        // каталога может не быть
    }
    return entries;
}
/** Расширяет process.env.PATH до spawn дочерних процессов. */
function augmentProcessPath() {
    if (process.platform === 'win32') {
        return;
    }
    const etcPaths = process.platform === 'darwin' ? readDarwinEtcPaths() : [];
    const extras = collectPathEntries(process.platform, os_1.default.homedir(), etcPaths);
    process.env.PATH = mergePath(process.env.PATH, extras);
}
//# sourceMappingURL=ProcessPathHelper.js.map