import type { EntityType } from "./types";

export interface DirectoryPolicy {
  description: string;
  allowed: string[];
  allowUpload?: boolean;
  allowDelete?: boolean;
  entities?: { type: EntityType; label: string }[];
}

const FIXED: Record<string, DirectoryPolicy> = {
  "": {
    description: "官网内容根目录，由系统维护固定模块。",
    allowed: ["既有模块目录", "company_info.json 公司信息"],
  },
  about: {
    description: "关于我们页面内容。",
    allowed: ["info.json 页面正文", "culture 企业文化目录"],
  },
  "about/culture": {
    description: "企业文化页面内容。",
    allowed: ["info.json 中英文文化内容"],
  },
  homepage: {
    description: "官网首页内容与首页卡片图片。",
    allowed: ["info.json 首页文案", "PNG、JPEG、GIF、WebP 图片"],
    allowUpload: true,
  },
  contact: {
    description: "联系我们页面内容。",
    allowed: ["info.json 联系信息", "地图及合作伙伴图片"],
    allowUpload: true,
  },
  "front-contact": {
    description: "官网页脚与联系区域使用的二维码。",
    allowed: ["PNG、JPEG、GIF、WebP 二维码图片"],
    allowUpload: true,
  },
  "front-slide": {
    description: "首页轮播图，文件名排序决定展示顺序。",
    allowed: ["PNG、JPEG、GIF、WebP 轮播图片"],
    allowUpload: true,
  },
  icons: {
    description: "产品分类使用的系统图标。为避免 SVG 脚本风险，后台暂不支持上传。",
    allowed: ["既有 SVG 图标"],
  },
  news: {
    description: "新闻列表。请使用“新建新闻”，系统会生成编号目录和 info.json。",
    allowed: ["header.json 新闻页头", "数字编号的新闻目录"],
    entities: [{ type: "news", label: "新建新闻" }],
  },
  honors: {
    description: "荣誉资质列表。请使用“新建荣誉”，系统会生成编号目录和 info.json。",
    allowed: ["landing.json 荣誉页头", "数字编号的荣誉目录"],
    entities: [{ type: "honor", label: "新建荣誉" }],
  },
  products: {
    description: "产品分类列表。请使用“新建产品分类”。",
    allowed: ["landing.json 产品页头", "数字编号的产品分类目录"],
    entities: [{ type: "product-category", label: "新建产品分类" }],
  },
  solutions: {
    description: "解决方案页面内容与行业图片。",
    allowed: ["info.json 页面正文", "PNG、JPEG、GIF、WebP 图片"],
    allowUpload: true,
  },
  technology: {
    description: "核心技术页面内容与技术图片。",
    allowed: ["info.json 页面正文", "PNG、JPEG、GIF、WebP 图片"],
    allowUpload: true,
  },
  service: {
    description: "服务页面内容与配图。",
    allowed: ["info.json 页面正文", "PNG、JPEG、GIF、WebP 图片"],
    allowUpload: true,
  },
  inquiries: {
    description: "官网自动生成的表单数据，只能在“表单数据”页面查看或删除。",
    allowed: ["系统生成的留言 JSON"],
  },
};

export function directoryPolicy(path: string): DirectoryPolicy {
  if (FIXED[path]) return FIXED[path];
  if (/^(news|honors)\/\d+$/.test(path)) {
    return {
      description: path.startsWith("news/") ? "单条新闻内容与配图。" : "单项荣誉内容与证书图片。",
      allowed: ["info.json 中英文内容", "PNG、JPEG、GIF、WebP 图片"],
      allowUpload: true,
      allowDelete: true,
    };
  }
  if (/^products\/\d+$/.test(path)) {
    return {
      description: "产品分类内容。请使用“新建子产品”添加产品。",
      allowed: ["info.json 分类信息", "分类编号开头的子产品目录"],
      allowDelete: true,
      entities: [{ type: "product-item", label: "新建子产品" }],
    };
  }
  if (/^products\/\d+\/\d+-\d+$/.test(path)) {
    return {
      description: "单个产品内容与产品图片。",
      allowed: ["info.json 中英文内容", "PNG、JPEG、GIF、WebP 图片"],
      allowUpload: true,
      allowDelete: true,
    };
  }
  return {
    description: "该目录不属于官网支持的内容结构。",
    allowed: ["不允许新增内容"],
  };
}
