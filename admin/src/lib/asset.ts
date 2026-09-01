import fs from "fs";
import path from "path";
import type { EntryKind, FsEntry, TreeNode } from "./types";
import { backupPaths } from "./backup";

const IMAGE_EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
export const ALLOWED_IMAGE_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_JSON_BYTES = 1024 * 1024;

export class PathError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PathError";
  }
}

export class JsonError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JsonError";
  }
}

export class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

export function getAssetDir(): string {
  return process.env.ASSET_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "../asset");
}

export function normalizeRelPath(rel: string): string {
  if (!rel || typeof rel !== "string") {
    throw new PathError("Path is required");
  }
  let p = rel.replace(/\\/g, "/").replace(/^\/+/, "");
  if (p.includes("\0")) throw new PathError("Invalid path");
  const parts = p.split("/").filter(Boolean);
  if (parts.some((seg) => seg === ".." || seg === ".")) {
    throw new PathError("Path traversal not allowed");
  }
  p = parts.join("/");
  return p;
}

export function resolveAssetPath(rel: string): string {
  const normalized = normalizeRelPath(rel);
  const root = fs.realpathSync(getAssetDir());
  const resolved = path.resolve(root, normalized);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) {
    throw new PathError("Path escapes asset root");
  }
  let current = root;
  for (const segment of normalized.split("/")) {
    current = path.join(current, segment);
    if (!fs.existsSync(current)) break;
    if (fs.lstatSync(current).isSymbolicLink()) {
      throw new PathError("Symbolic links are not allowed");
    }
  }
  return resolved;
}

export function isInquiryPath(rel: string): boolean {
  const n = normalizeRelPath(rel);
  return n === "inquiries" || n.startsWith("inquiries/");
}

export function assertWritable(
  rel: string,
  op: "write" | "upload" | "mkdir" | "rename" | "delete"
): void {
  if (isInquiryPath(rel) && op !== "delete") {
    throw new PathError("inquiries/ is read-only (delete allowed)");
  }
}

export function detectKind(fileName: string, isDirectory: boolean): EntryKind {
  if (isDirectory) return "dir";
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".json") return "json";
  if (IMAGE_EXTS.has(ext)) return "image";
  return "file";
}

function contentTypeForExt(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    default:
      return "image/png";
  }
}

function skipName(name: string): boolean {
  return name.startsWith(".") || name === ".DS_Store";
}

export function listTree(rel = ""): TreeNode {
  const rootRel = rel ? normalizeRelPath(rel) : "";
  const abs = rootRel ? resolveAssetPath(rootRel) : fs.realpathSync(getAssetDir());
  const name = rootRel ? path.basename(rootRel) : "asset";

  function walk(absPath: string, relPath: string): TreeNode {
    const st = fs.lstatSync(absPath);
    if (st.isSymbolicLink()) throw new PathError("Symbolic links are not allowed");
    if (!st.isDirectory()) {
      return {
        name: path.basename(absPath),
        path: relPath,
        kind: detectKind(path.basename(absPath), false),
      };
    }
    const children: TreeNode[] = [];
    for (const entry of fs.readdirSync(absPath).sort((a, b) => a.localeCompare(b, "zh-CN", { numeric: true }))) {
      if (skipName(entry)) continue;
      const childAbs = path.join(absPath, entry);
      const childRel = relPath ? `${relPath}/${entry}` : entry;
      const cst = fs.lstatSync(childAbs);
      if (cst.isSymbolicLink()) continue;
      if (cst.isDirectory()) {
        children.push(walk(childAbs, childRel));
      } else {
        children.push({
          name: entry,
          path: childRel,
          kind: detectKind(entry, false),
        });
      }
    }
    return { name: path.basename(absPath) || name, path: relPath, kind: "dir", children };
  }

  if (!fs.existsSync(abs)) {
    throw new PathError("Asset directory not found");
  }
  return walk(abs, rootRel);
}

export function getEntry(rel: string): FsEntry {
  const normalized = normalizeRelPath(rel);
  const abs = resolveAssetPath(normalized);
  if (!fs.existsSync(abs)) {
    throw new PathError("Not found");
  }
  const st = fs.statSync(abs);
  const meta = {
    path: normalized,
    size: st.size,
    mtime: st.mtime.toISOString(),
  };

  if (st.isDirectory()) {
    const children = fs
      .readdirSync(abs)
      .filter((n) => !skipName(n))
      .sort((a, b) => a.localeCompare(b, "zh-CN", { numeric: true }))
      .map((n) => {
        const childAbs = path.join(abs, n);
        const isDir = fs.statSync(childAbs).isDirectory();
        return {
          name: n,
          path: `${normalized}/${n}`,
          kind: detectKind(n, isDir),
        };
      });
    return { ...meta, kind: "dir", children };
  }

  const kind = detectKind(path.basename(abs), false);
  if (kind === "json") {
    return { ...meta, kind: "json", data: readJson(normalized) };
  }
  if (kind === "image") {
    const ext = path.extname(abs).toLowerCase();
    return {
      ...meta,
      kind: "image",
      mime: contentTypeForExt(ext),
      previewUrl: `/api/admin/fs/raw?path=${encodeURIComponent(normalized)}`,
    };
  }
  return { ...meta, kind: "file" };
}

export function readJson<T = unknown>(rel: string): T {
  const abs = resolveAssetPath(rel);
  try {
    return JSON.parse(fs.readFileSync(abs, "utf-8")) as T;
  } catch {
    throw new JsonError(`Failed to parse JSON: ${rel}`);
  }
}

export function writeJson(rel: string, data: unknown): void {
  assertWritable(rel, "write");
  const abs = resolveAssetPath(rel);
  if (!rel.toLowerCase().endsWith(".json")) {
    throw new PathError("JSON path must end with .json");
  }
  const serialized = JSON.stringify(data, null, 2) + "\n";
  if (Buffer.byteLength(serialized, "utf-8") > MAX_JSON_BYTES) {
    throw new JsonError(`JSON is too large (max ${MAX_JSON_BYTES} bytes)`);
  }
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  if (fs.existsSync(abs)) {
    backupPaths([{ rel: normalizeRelPath(rel), abs }]);
  }
  const tmp = abs + ".tmp";
  fs.writeFileSync(tmp, serialized, "utf-8");
  fs.renameSync(tmp, abs);
}

export function readFileBuffer(rel: string): Buffer {
  return fs.readFileSync(resolveAssetPath(rel));
}

export function writeFileBuffer(rel: string, data: Buffer): void {
  assertWritable(rel, "write");
  const abs = resolveAssetPath(rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  if (fs.existsSync(abs)) {
    backupPaths([{ rel: normalizeRelPath(rel), abs }]);
  }
  const tmp = abs + ".tmp";
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, abs);
}

export function mkdir(rel: string): void {
  assertWritable(rel, "mkdir");
  const abs = resolveAssetPath(rel);
  fs.mkdirSync(abs, { recursive: true });
}

export function remove(rel: string): void {
  const normalized = normalizeRelPath(rel);
  if (!normalized) throw new PathError("Cannot delete asset root");
  assertWritable(normalized, "delete");
  const abs = resolveAssetPath(normalized);
  if (!fs.existsSync(abs)) throw new PathError("Not found");
  backupPaths([{ rel: normalized, abs }]);
  fs.rmSync(abs, { recursive: true, force: true });
}

export function rename(fromRel: string, toRel: string): void {
  assertWritable(fromRel, "rename");
  assertWritable(toRel, "rename");
  const fromAbs = resolveAssetPath(fromRel);
  const toAbs = resolveAssetPath(toRel);
  if (!fs.existsSync(fromAbs)) throw new PathError("Source not found");
  if (fs.existsSync(toAbs)) throw new PathError("Destination already exists");
  backupPaths([{ rel: normalizeRelPath(fromRel), abs: fromAbs }]);
  fs.mkdirSync(path.dirname(toAbs), { recursive: true });
  fs.renameSync(fromAbs, toAbs);
}

function hasValidImageSignature(ext: string, data: Buffer): boolean {
  if (ext === ".png") return data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (ext === ".jpg" || ext === ".jpeg") return data[0] === 0xff && data[1] === 0xd8 && data.at(-2) === 0xff && data.at(-1) === 0xd9;
  if (ext === ".gif") return data.subarray(0, 6).toString("ascii") === "GIF87a" || data.subarray(0, 6).toString("ascii") === "GIF89a";
  if (ext === ".webp") return data.subarray(0, 4).toString("ascii") === "RIFF" && data.subarray(8, 12).toString("ascii") === "WEBP";
  return false;
}

export function assertValidUpload(destRel: string, mime: string, data: Buffer): void {
  const ext = path.extname(destRel).toLowerCase();
  const expectedMime = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : ext === ".gif" ? "image/gif" : ext === ".webp" ? "image/webp" : "";
  if (!expectedMime || !ALLOWED_IMAGE_MIMES.has(mime) || mime !== expectedMime) {
    throw new UploadError("Only PNG, JPEG, GIF, and WebP images are allowed, and the extension must match the file type");
  }
  const size = data.length;
  if (size > MAX_UPLOAD_BYTES) {
    throw new UploadError(`File too large (max ${MAX_UPLOAD_BYTES} bytes)`);
  }
  if (!hasValidImageSignature(ext, data)) {
    throw new UploadError("File content does not match its image type");
  }
}

export function uploadFile(destRel: string, data: Buffer, mime: string): void {
  assertWritable(destRel, "upload");
  assertValidUpload(destRel, mime, data);
  writeFileBuffer(destRel, data);
}

export function nextNumericId(parentRel: string): string {
  const abs = resolveAssetPath(parentRel);
  if (!fs.existsSync(abs)) {
    fs.mkdirSync(abs, { recursive: true });
  }
  let max = 0;
  for (const name of fs.readdirSync(abs)) {
    if (/^\d+$/.test(name) && fs.statSync(path.join(abs, name)).isDirectory()) {
      max = Math.max(max, parseInt(name, 10));
    }
  }
  return String(max + 1);
}

export function nextProductItemId(categoryRel: string): string {
  const abs = resolveAssetPath(categoryRel);
  const catId = path.basename(categoryRel);
  if (!fs.existsSync(abs)) {
    throw new PathError("Category not found");
  }
  let max = 0;
  const re = new RegExp(`^${catId}-(\\d+)$`);
  for (const name of fs.readdirSync(abs)) {
    const m = name.match(re);
    if (m && fs.statSync(path.join(abs, name)).isDirectory()) {
      max = Math.max(max, parseInt(m[1], 10));
    }
  }
  return `${catId}-${max + 1}`;
}
