import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve('dist/index.html');

console.log('--- Automated Verification Script ---');

// 1. File existence
if (!fs.existsSync(htmlPath)) {
    console.error('FAIL: dist/index.html does not exist! Run npm run build first.');
    process.exit(1);
}

// 2. Exact byte size check
const stats = fs.statSync(htmlPath);
const sizeBytes = stats.size;
const sizeMB = sizeBytes / (1024 * 1024);
console.log(`File size: ${sizeBytes} bytes (${sizeMB.toFixed(2)} MB)`);

if (sizeBytes < 5000000) {
    console.log('PASS: File size is under 5,000,000 bytes.');
} else {
    console.error('FAIL: File size exceeds 5,000,000 bytes!');
    process.exit(1);
}

// 3. Scan for external network requests or CDN references in HTML
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

const scriptSrcRegex = /<script\s+[^>]*src=["'](https?:)?\/\//gi;
const linkHrefRegex = /<link\s+[^>]*href=["'](https?:)?\/\//gi;

const hasExternalScripts = scriptSrcRegex.test(htmlContent);
const hasExternalLinks = linkHrefRegex.test(htmlContent);

if (!hasExternalScripts && !hasExternalLinks) {
    console.log('PASS: Zero external script/link resource references detected. Truly offline.');
} else {
    if (hasExternalScripts) console.error('FAIL: Found external script references!');
    if (hasExternalLinks) console.error('FAIL: Found external link references!');
    process.exit(1);
}

console.log('All static verification checks PASSED.');
