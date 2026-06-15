import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { localizeData, getLocaleFromRequest } from "@/lib/localize";

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
              const productId = productData.id;
              let productImages = productData.images || [];

              // If images array is empty, dynamically scan the folder for images
              if (productImages.length === 0) {
                const imageExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"];
                try {
                  const pFiles = fs.readdirSync(productDir);
                  const scannedImages = pFiles
                    .filter((f) => {
                      const ext = path.extname(f).toLowerCase();
                      const isFile = fs.statSync(path.join(productDir, f)).isFile();
                      return isFile && imageExtensions.includes(ext);
                    })
                    .map((f) => `/api/products/image/${categoryId}/${productId}/${f}`);
                  productImages = scannedImages;
                } catch (e) {
                  console.error(`Failed to scan product directory for images: ${productDir}`, e);
                }
              } else {
                // Map existing relative image paths to the api endpoint
                productImages = productImages.map((img: string) => {
                  if (img.startsWith("/") || img.startsWith("http")) {
                    return img;
                  }
                  return `/api/products/image/${categoryId}/${productId}/${img}`;
                });
              }

              productData.images = productImages;
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

    return NextResponse.json(localizeData(categoryData, locale));
  } catch (error) {
    console.error("Error loading category details:", error);
    return NextResponse.json({ error: "Failed to load category details" }, { status: 500 });
  }
}
