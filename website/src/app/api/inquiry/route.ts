import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, contactPerson, phone, email, interest, description, products } = body;

    // Server-side validation
    if (!companyName || !companyName.trim()) {
      return NextResponse.json({ success: false, error: "公司名称为必填项" }, { status: 400 });
    }
    if (!contactPerson || !contactPerson.trim()) {
      return NextResponse.json({ success: false, error: "联系人为必填项" }, { status: 400 });
    }
    if (!phone || !phone.trim()) {
      return NextResponse.json({ success: false, error: "手机号码为必填项" }, { status: 400 });
    }

    const assetDir = path.join(process.cwd(), "../asset");
    const inquiriesDir = path.join(assetDir, "inquiries");

    // Create inquiries folder if not exists
    if (!fs.existsSync(inquiriesDir)) {
      fs.mkdirSync(inquiriesDir, { recursive: true });
    }

    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const fileName = `inquiry_${timestamp}_${random}.json`;
    const filePath = path.join(inquiriesDir, fileName);

    const inquiryData = {
      id: `${timestamp}_${random}`,
      companyName: companyName.trim(),
      contactPerson: contactPerson.trim(),
      phone: phone.trim(),
      email: (email || "").trim(),
      interest: interest || "未知",
      description: description || "",
      products: products || [],
      createdAt: new Date().toISOString()
    };

    fs.writeFileSync(filePath, JSON.stringify(inquiryData, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing inquiry submission:", error);
    return NextResponse.json({ success: false, error: "服务器内部错误，提交失败" }, { status: 500 });
  }
}
