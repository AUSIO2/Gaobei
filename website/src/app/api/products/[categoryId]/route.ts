import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await props.params;
    const assetDir = path.join(process.cwd(), "../asset/products", categoryId);
    
    if (!fs.existsSync(assetDir) || !fs.statSync(assetDir).isDirectory()) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const categoryInfoPath = path.join(assetDir, "info.json");
    if (!fs.existsSync(categoryInfoPath)) {
      return NextResponse.json({ error: "Category configuration not found" }, { status: 404 });
    }

    const categoryContent = fs.readFileSync(categoryInfoPath, "utf-8");
    const categoryData = JSON.parse(categoryContent);

    // Load products in this category
    const products: any[] = [];
    const files = fs.readdirSync(assetDir);
    for (const fileName of files) {
      const productDir = path.join(assetDir, fileName);
      if (fs.statSync(productDir).isDirectory()) {
        const productInfoPath = path.join(productDir, "info.json");
        if (fs.existsSync(productInfoPath)) {
          try {
            const productContent = fs.readFileSync(productInfoPath, "utf-8");
            const productData = JSON.parse(productContent);
            if (productData && productData.id) {
              products.push(productData);
            }
          } catch (err) {
            console.error(`Failed to parse product info in ${fileName}:`, err);
          }
        }
      }
    }

    // Sort products by id ascending
    products.sort((a, b) => a.id.localeCompare(b.id));

    categoryData.products = products;

    return NextResponse.json(categoryData);
  } catch (error) {
    console.error("Error loading category details:", error);
    return NextResponse.json({ error: "Failed to load category details" }, { status: 500 });
  }
}
