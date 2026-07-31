import fs from 'fs';
import path from 'path';

const src = path.resolve('dist/index.html');
const dest = path.resolve('dist/applovin.html');

if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('Successfully generated dist/applovin.html from dist/index.html');
} else {
    console.error('Error: dist/index.html not found! Build failed.');
    process.exit(1);
}
