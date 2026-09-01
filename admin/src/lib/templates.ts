import { mkdir, nextNumericId, nextProductItemId, writeJson } from "./asset";
import type { CreateEntityInput } from "./types";

export function newsTemplate(id: string): object {
  return {
    id,
    title: "新新闻标题",
    titleEn: "New Article Title",
    date: new Date().toISOString().slice(0, 10),
    category: "企业要闻",
    categoryEn: "Company News",
    type: "case",
    coverImage: "",
    summary: "",
    summaryEn: "",
    content: "",
    contentEn: "",
    images: [],
  };
}

export function honorTemplate(id: string): object {
  return {
    id,
    title: "新荣誉称号",
    titleEn: "New Honor Title",
    tag: "",
    tagEn: "",
    desc: "",
    descEn: "",
    images: [],
  };
}

export function productCategoryTemplate(id: string): object {
  return {
    id,
    name: "新分类",
    nameEn: "New Category",
    icon: "",
    specs: [],
    specsEn: [],
  };
}

export function productItemTemplate(id: string): object {
  return {
    id,
    name: "新产品",
    nameEn: "New Product",
    summary: "",
    summaryEn: "",
    specs: [],
    specsEn: [],
    content: "",
    contentEn: "",
    images: [],
  };
}

export function createEntity(input: CreateEntityInput): { path: string; id: string } {
  switch (input.type) {
    case "news": {
      const id = nextNumericId("news");
      const dir = `news/${id}`;
      mkdir(dir);
      writeJson(`${dir}/info.json`, newsTemplate(id));
      return { path: dir, id };
    }
    case "honor": {
      const id = nextNumericId("honors");
      const dir = `honors/${id}`;
      mkdir(dir);
      writeJson(`${dir}/info.json`, honorTemplate(id));
      return { path: dir, id };
    }
    case "product-category": {
      const id = nextNumericId("products");
      const dir = `products/${id}`;
      mkdir(dir);
      writeJson(`${dir}/info.json`, productCategoryTemplate(id));
      return { path: dir, id };
    }
    case "product-item": {
      if (!input.parentPath) throw new Error("parentPath required for product-item");
      const id = nextProductItemId(input.parentPath);
      const dir = `${input.parentPath}/${id}`;
      mkdir(dir);
      writeJson(`${dir}/info.json`, productItemTemplate(id));
      return { path: dir, id };
    }
    default:
      throw new Error(`Unknown entity type: ${(input as CreateEntityInput).type}`);
  }
}
