#!/usr/bin/env node
/**
 * Script to add locale parameter to all API fetch calls.
 * This adds `useLocale` import and appends `?locale=${locale}` to fetch URLs.
 */

const fs = require('fs');
const path = require('path');

const files = [
  // Components
  'src/components/sections/TechHighlights.tsx',
  'src/components/sections/SolutionsPreview.tsx', 
  'src/components/sections/StatsCounter.tsx',
  'src/components/sections/CTASection.tsx',
  'src/components/sections/Footer.tsx',
  'src/components/sections/OverviewSection.tsx',
  'src/components/sections/FrontSlide.tsx',
  'src/components/ui/Navbar.tsx',
  // Pages
  'src/app/[locale]/technology/page.tsx',
  'src/app/[locale]/about/page.tsx',
  'src/app/[locale]/about/culture/page.tsx',
  'src/app/[locale]/about/honors/page.tsx',
  'src/app/[locale]/contact/page.tsx',
  'src/app/[locale]/solutions/page.tsx',
  'src/app/[locale]/products/page.tsx',
  'src/app/[locale]/products/[categoryId]/page.tsx',
  'src/app/[locale]/products/[categoryId]/[productId]/page.tsx',
  'src/app/[locale]/news/[id]/page.tsx',
];

const root = process.cwd();

for (const file of files) {
  const filePath = path.join(root, file);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${file} (not found)`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Step 1: Add useLocale import if not present
  if (!content.includes('useLocale')) {
    if (content.includes('from "next-intl"')) {
      // Already imports from next-intl, add useLocale
      content = content.replace(
        /import\s*\{([^}]*)\}\s*from\s*"next-intl"/,
        (match, imports) => {
          if (!imports.includes('useLocale')) {
            return `import {${imports}, useLocale } from "next-intl"`;
          }
          return match;
        }
      );
      modified = true;
    } else {
      // Add new import after first import line
      content = content.replace(
        /(^"use client";\s*\n)/m,
        '$1\nimport { useLocale } from "next-intl";\n'
      );
      if (!content.includes('useLocale')) {
        // Fallback: add after first import
        content = content.replace(
          /(import\s+.*\n)/,
          '$1import { useLocale } from "next-intl";\n'
        );
      }
      modified = true;
    }
  }

  // Step 2: Add locale variable in the component function (after first useState or at start of function body)
  if (!content.includes('const locale = useLocale()')) {
    // Find the component function and add locale after the first line
    content = content.replace(
      /export default function \w+\([^)]*\)\s*\{/,
      (match) => `${match}\n  const locale = useLocale();`
    );
    modified = true;
  }

  // Step 3: Replace fetch("/api/xxx") with fetch(\`/api/xxx?locale=\${locale}\`)
  // But NOT /api/inquiry (POST, no locale needed) and NOT /api/slides (images only)
  content = content.replace(
    /fetch\("(\/api\/(?!inquiry|slides)[^"]*?)"\)/g,
    'fetch(`$1?locale=${locale}`)'
  );

  // Also handle .then chains on the same pattern
  content = content.replace(
    /fetch\("(\/api\/(?!inquiry|slides)[^"]*?)"\)/g,
    'fetch(`$1?locale=${locale}`)'
  );

  if (modified || content !== fs.readFileSync(filePath, 'utf-8')) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`OK: ${file}`);
  } else {
    console.log(`UNCHANGED: ${file}`);
  }
}

console.log('\nDone!');
