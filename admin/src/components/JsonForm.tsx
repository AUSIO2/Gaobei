"use client";

import { fieldOptions, fieldRule, validateTextValue } from "@/lib/content-validation";

type PathPart = string | number;

const FIELD_LABELS: Record<string, string> = {
  hero: "页头区域",
  info: "基本信息",
  intro: "介绍",
  title: "标题",
  subtitle: "副标题",
  description: "描述",
  desc: "说明",
  content: "正文",
  summary: "摘要",
  name: "名称",
  date: "日期",
  category: "分类",
  image: "图片文件",
  images: "图片列表",
  mapImage: "地图图片",
  coverImage: "封面图片",
  address: "地址",
  phone: "电话",
  servicePhone: "客服电话",
  recruitmentEmail: "招聘邮箱",
  email: "邮箱",
  tag: "标签",
  id: "编号",
  contacts: "联系人",
  contactPerson: "联系人姓名",
  partners: "合作伙伴",
  cards: "内容卡片",
  items: "内容列表",
  paragraphs: "段落",
  specs: "规格参数",
  pills: "数据标签",
  highlights: "亮点",
  points: "要点",
  industries: "行业",
  products: "产品",
  buttons: "按钮",
  href: "链接地址",
  type: "类型",
  year: "年份",
  footer: "页脚",
  qrCodes: "二维码",
  label: "标签文字",
  role: "角色",
  department: "部门",
};

function labelFor(key: string): string {
  return FIELD_LABELS[key] || key;
}

function isMultiline(value: string, key: string): boolean {
  return ["content", "description", "desc", "summary", "paragraphs"].includes(key) || value.length > 80 || value.includes("\n");
}

function updateAtPath(root: unknown, path: PathPart[], value: unknown): unknown {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const source = root && typeof root === "object" ? root : typeof head === "number" ? [] : {};
  if (Array.isArray(source)) {
    const index = Number(head);
    const copy = [...source];
    copy[index] = updateAtPath(source[index], rest, value);
    return copy;
  }
  const key = String(head);
  const record = source as Record<string, unknown>;
  return { ...record, [key]: updateAtPath(record[key], rest, value) };
}

function blankFromSample(sample: unknown): unknown {
  if (typeof sample === "string") return "";
  if (typeof sample === "number") return 0;
  if (typeof sample === "boolean") return false;
  if (Array.isArray(sample)) return [];
  if (sample && typeof sample === "object") {
    return Object.fromEntries(
      Object.entries(sample)
        .filter(([key]) => !key.endsWith("En"))
        .map(([key, value]) => [key, blankFromSample(value)])
    );
  }
  return "";
}

function ValueEditor(props: {
  fieldKey: string;
  contentPath: string;
  value: unknown;
  path: PathPart[];
  root: unknown;
  onChange: (next: unknown) => void;
}) {
  const { contentPath, fieldKey, value, path, root, onChange } = props;
  const setValue = (next: unknown) => onChange(updateAtPath(root, path, next));

  if (typeof value === "string") {
    const rule = fieldRule(contentPath, fieldKey, path);
    const issue = validateTextValue(value, fieldKey, rule);
    const options = fieldOptions(contentPath, fieldKey);
    const common = "mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100";
    const control = options ? (
      <select className={common} required={rule.required} value={value} onChange={(event) => setValue(event.target.value)}>
        <option value="" disabled>请选择</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    ) : isMultiline(value, fieldKey) ? (
      <textarea className={common} rows={5} required={rule.required} readOnly={rule.readOnly} maxLength={rule.maxLength} value={value} onChange={(event) => setValue(event.target.value)} />
    ) : (
      <input className={`${common} ${rule.readOnly ? "bg-neutral-100 text-neutral-500" : ""}`} type={rule.inputType} required={rule.required} readOnly={rule.readOnly} maxLength={rule.maxLength} value={value} onChange={(event) => setValue(event.target.value)} />
    );
    return (
      <>
        {control}
        <div className={`mt-1 flex justify-between text-[11px] ${issue ? "text-red-600" : "text-neutral-400"}`}>
          <span>{rule.readOnly ? "系统生成，不可修改" : issue || (rule.required ? "必填" : "选填")}</span>
          <span>{value.length}/{rule.maxLength}</span>
        </div>
      </>
    );
  }

  if (typeof value === "number") {
    return <input type="number" min={-1000000000} max={1000000000} step="any" className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm" value={value} onChange={(event) => setValue(Number(event.target.value))} />;
  }

  if (typeof value === "boolean") {
    return (
      <label className="mt-2 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={value} onChange={(event) => setValue(event.target.checked)} />
        {value ? "是" : "否"}
      </label>
    );
  }

  if (Array.isArray(value)) {
    return (
      <div className="mt-2 space-y-3">
        {value.map((item, index) => (
          <div key={index} className="rounded-lg border border-neutral-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-500">第 {index + 1} 项</span>
              <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => setValue(value.filter((_, itemIndex) => itemIndex !== index))}>删除</button>
            </div>
            <ValueEditor contentPath={contentPath} fieldKey={fieldKey} value={item} path={[...path, index]} root={root} onChange={onChange} />
          </div>
        ))}
        <button
          type="button"
          className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs hover:bg-neutral-50"
          onClick={() => setValue([...value, blankFromSample(value[0])])}
        >
          + 添加一项
        </button>
      </div>
    );
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([key]) => !key.endsWith("En"));
    const objectValue = value as Record<string, unknown>;
    return (
      <div className="mt-2 space-y-3 border-l-2 border-neutral-100 pl-4">
        {entries.map(([key, child]) => {
          const englishKey = `${key}En`;
          const hasEnglish = Object.hasOwn(objectValue, englishKey);
          return (
            <Field
              key={key}
              contentPath={contentPath}
              fieldKey={key}
              value={child}
              path={[...path, key]}
              englishValue={hasEnglish ? objectValue[englishKey] : undefined}
              englishPath={hasEnglish ? [...path, englishKey] : undefined}
              root={root}
              onChange={onChange}
            />
          );
        })}
      </div>
    );
  }

  return <input className="mt-1 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm" value="" onChange={(event) => setValue(event.target.value)} />;
}

function Field(props: {
  fieldKey: string;
  contentPath: string;
  value: unknown;
  path: PathPart[];
  englishValue?: unknown;
  englishPath?: PathPart[];
  root: unknown;
  onChange: (next: unknown) => void;
}) {
  const grouped = (props.value && typeof props.value === "object") || Array.isArray(props.value);
  return (
    <section className={grouped ? "rounded-xl border border-neutral-200 bg-neutral-50/60 p-4" : ""}>
      <label className="block text-xs font-semibold text-neutral-700">
        {labelFor(props.fieldKey)}
        {FIELD_LABELS[props.fieldKey] && <span className="ml-1 font-normal text-neutral-400">({props.fieldKey})</span>}
      </label>
      {props.englishPath ? (
        <div className="mt-2 grid gap-3 lg:grid-cols-2">
          <div>
            <div className="text-[11px] font-medium text-neutral-500">中文</div>
            <ValueEditor contentPath={props.contentPath} fieldKey={props.fieldKey} value={props.value} path={props.path} root={props.root} onChange={props.onChange} />
          </div>
          <div>
            <div className="text-[11px] font-medium text-neutral-500">English</div>
            <ValueEditor contentPath={props.contentPath} fieldKey={`${props.fieldKey}En`} value={props.englishValue} path={props.englishPath} root={props.root} onChange={props.onChange} />
          </div>
        </div>
      ) : (
        <ValueEditor contentPath={props.contentPath} fieldKey={props.fieldKey} value={props.value} path={props.path} root={props.root} onChange={props.onChange} />
      )}
    </section>
  );
}

export function JsonForm(props: { contentPath: string; value: unknown; onChange: (next: unknown) => void }) {
  if (!props.value || typeof props.value !== "object" || Array.isArray(props.value)) {
    return <ValueEditor contentPath={props.contentPath} fieldKey="内容" value={props.value} path={[]} root={props.value} onChange={props.onChange} />;
  }

  return (
    <div className="space-y-4 pb-8">
      <div className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
        中文和英文分别填写，系统不会自动翻译；保存时会自动写入数据文件。
      </div>
      {Object.entries(props.value)
        .filter(([key]) => !key.endsWith("En"))
        .map(([key, value]) => {
          const objectValue = props.value as Record<string, unknown>;
          const englishKey = `${key}En`;
          const hasEnglish = Object.hasOwn(objectValue, englishKey);
          return (
            <Field
              key={key}
              contentPath={props.contentPath}
              fieldKey={key}
              value={value}
              path={[key]}
              englishValue={hasEnglish ? objectValue[englishKey] : undefined}
              englishPath={hasEnglish ? [englishKey] : undefined}
              root={props.value}
              onChange={props.onChange}
            />
          );
        })}
    </div>
  );
}
