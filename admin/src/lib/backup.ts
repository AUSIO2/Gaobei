import fs from "fs";
import path from "path";

export function getBackupDir(): string {
  return process.env.BACKUP_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "../asset-backups");
}

export function listBackups(): { name: string; mtime: string }[] {
  const dir = getBackupDir();
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((name) => fs.statSync(path.join(dir, name)).isDirectory())
    .map((name) => {
      const st = fs.statSync(path.join(dir, name));
      return { name, mtime: st.mtime.toISOString() };
    })
    .sort((a, b) => b.name.localeCompare(a.name));
}

export function pruneBackups(keep = 30): void {
  const backups = listBackups();
  for (const b of backups.slice(keep)) {
    fs.rmSync(path.join(getBackupDir(), b.name), { recursive: true, force: true });
  }
}

export function copyIntoBackup(ts: string, absSource: string, rel: string): void {
  if (!fs.existsSync(absSource)) return;
  const dest = path.join(getBackupDir(), ts, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const st = fs.statSync(absSource);
  if (st.isDirectory()) {
    fs.cpSync(absSource, dest, { recursive: true });
  } else {
    fs.copyFileSync(absSource, dest);
  }
}

/** Backup given absolute paths mapped from relative paths; returns timestamp id. */
export function backupPaths(
  items: { rel: string; abs: string }[]
): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  fs.mkdirSync(path.join(getBackupDir(), ts), { recursive: true });
  for (const item of items) {
    copyIntoBackup(ts, item.abs, item.rel);
  }
  pruneBackups(30);
  return ts;
}
