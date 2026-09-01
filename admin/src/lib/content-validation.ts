export interface FieldRule {
  required: boolean;
  readOnly: boolean;
  maxLength: number;
  inputType: "text" | "date" | "email" | "tel";
}

export function fieldOptions(contentPath: string, key: string): string[] | null {
  if (!/^news\/\d+\/info\.json$/.test(contentPath) || isEnglishKey(key)) return null;
  if (key === "category") return ["企业要闻", "技术研发", "合作签约", "行业展会"];
  if (key === "type") return ["news", "case", "blog"];
  return null;
}

function baseKey(key: string): string {
  return key.endsWith("En") ? key.slice(0, -2) : key;
}

function isEnglishKey(key: string): boolean {
  return key.endsWith("En");
}

export function fieldRule(contentPath: string, key: string, dataPath: (string | number)[]): FieldRule {
  const base = baseKey(key);
  const english = isEnglishKey(key);
  const entityId = base === "id" && dataPath.length === 1 && /^(news|honors)\/\d+\/info\.json$|^products\/\d+(?:\/\d+-\d+)?\/info\.json$/.test(contentPath);
  const requiredByKey = !english && ["title", "name"].includes(base);
  const requiredByPage = !english && (
    (/^news\/\d+\/info\.json$/.test(contentPath) && ["id", "title", "date", "category", "content"].includes(base)) ||
    (/^honors\/\d+\/info\.json$/.test(contentPath) && ["id", "title", "desc"].includes(base)) ||
    (/^products\/\d+(?:\/\d+-\d+)?\/info\.json$/.test(contentPath) && ["id", "name"].includes(base))
  );

  let maxLength = 2000;
  if (["title", "name", "label", "tag", "category", "role", "department"].includes(base)) maxLength = english ? 240 : 120;
  if (["subtitle"].includes(base)) maxLength = english ? 400 : 200;
  if (["summary"].includes(base)) maxLength = english ? 1000 : 500;
  if (["description", "desc"].includes(base)) maxLength = 3000;
  if (base === "content") maxLength = 50000;
  if (["image", "mapImage", "coverImage", "icon"].includes(base)) maxLength = 255;
  if (base === "address") maxLength = 500;
  if (base.toLowerCase().includes("email")) maxLength = 254;
  if (base.toLowerCase().includes("phone")) maxLength = 30;
  if (base === "href") maxLength = 500;
  if (base === "id") maxLength = 40;

  const lower = base.toLowerCase();
  const inputType = base === "date"
    ? "date"
    : lower.includes("email")
      ? "email"
      : lower.includes("phone")
        ? "tel"
        : "text";

  return {
    required: requiredByKey || requiredByPage,
    readOnly: base === "id",
    maxLength,
    inputType,
  };
}

export function validateTextValue(value: string, key: string, rule: FieldRule): string | null {
  const trimmed = value.trim();
  const base = baseKey(key);
  if (rule.required && !trimmed) return "此项为必填项";
  if (value.length > rule.maxLength) return `最多 ${rule.maxLength} 个字符`;
  if (!trimmed) return null;
  if (rule.inputType === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return "邮箱格式不正确";
  if (rule.inputType === "tel" && !/^\+?[0-9\s()\-]{7,30}$/.test(trimmed)) return "电话格式不正确";
  if (rule.inputType === "date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed) || Number.isNaN(Date.parse(`${trimmed}T00:00:00Z`))) return "日期格式应为 YYYY-MM-DD";
  }
  if (base === "href" && !/^(\/|https?:\/\/|mailto:|tel:|#)/.test(trimmed)) return "链接应使用站内路径或完整网址";
  if (base === "id" && !/^[A-Za-z0-9_-]{1,40}$/.test(trimmed)) return "ID 只能包含字母、数字、下划线和连字符";
  return null;
}

function expectedEntityId(contentPath: string): string | null {
  const match = contentPath.match(/^(?:news|honors)\/(\d+)\/info\.json$|^products\/\d+\/(\d+-\d+)\/info\.json$|^products\/(\d+)\/info\.json$/);
  return match ? match[1] || match[2] || match[3] : null;
}

export function validateContent(contentPath: string, data: unknown): string[] {
  const errors: string[] = [];

  function walk(value: unknown, dataPath: (string | number)[], fieldKey = "内容") {
    if (typeof value === "string") {
      const issue = validateTextValue(value, fieldKey, fieldRule(contentPath, fieldKey, dataPath));
      if (issue) errors.push(`${dataPath.join(".") || "内容"}：${issue}`);
      const options = fieldOptions(contentPath, fieldKey);
      if (options && value && !options.includes(value)) errors.push(`${dataPath.join(".")}：请选择有效选项`);
      return;
    }
    if (typeof value === "number") {
      if (!Number.isFinite(value) || Math.abs(value) > 1_000_000_000) errors.push(`${dataPath.join(".")}：数字超出允许范围`);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((item, index) => walk(item, [...dataPath, index], fieldKey));
      return;
    }
    if (value && typeof value === "object") {
      Object.entries(value).forEach(([key, child]) => walk(child, [...dataPath, key], key));
    }
  }

  walk(data, []);
  const expectedId = expectedEntityId(contentPath);
  if (expectedId && (!data || typeof data !== "object" || Array.isArray(data) || String((data as Record<string, unknown>).id) !== expectedId)) {
    errors.push(`id：必须与目录编号 ${expectedId} 一致`);
  }
  return errors;
}
