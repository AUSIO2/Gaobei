import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { localizeData, getLocaleFromRequest } from "@/lib/localize";
import { productImageUrl } from "@/lib/asset-urls";
import { resolveImageList } from "@/lib/serve-asset";

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await props.params;
    const locale = getLocaleFromRequest(request);
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
              const productId = productData.id;
              productData.images = resolveImageList(
                productData.images,
                productDir,
                (f) => productImageUrl(categoryId, productId, f)
              );
              products.push(productData);
            }
          } catch (err) {
            console.error(`Failed to parse product info in ${fileName}:`, err);
          }
        }
      }
    }

    products.sort((a, b) => a.id.localeCompare(b.id));
    categoryData.products = products;

    return NextResponse.json(localizeData(categoryData, locale));
  } catch (error) {
    console.error("Error loading category details:", error);
    return NextResponse.json({ error: "Failed to load category details" }, { status: 500 });
  }
}
