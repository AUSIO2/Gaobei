import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Helper to get filepath
const getInfoPath = () => path.join(process.cwd(), "../asset/service/info.json");

const defaultInfo = {
  domestic: {
    title: "国内服务网络",
    description: "覆盖国内所有省级、地级市城市的产品服务网络",
    images: []
  },
  international: {
    title: "国际服务网络",
    description: "产品远销美洲、欧洲、非洲、亚洲等34个国家和地区",
    images: []
  },
  cases: {
    title: "客户案例",
    points: [
      "三维智能织造成型系统装机量行业领先",
      "军品级碳纤维三维结构件特种压力容器研发市占率第一",
      "三维环形织造机、曲面织造机在航空航天领域深度服役"
    ],
    images: []
  }
};

export async function GET() {
  try {
    const filePath = getInfoPath();
    if (!fs.existsSync(filePath)) {
      // Return defaults if not exists yet
      return NextResponse.json(defaultInfo);
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error reading service config:", error);
    return NextResponse.json({ error: "Failed to read service config" }, { status: 500 });
  }
}
