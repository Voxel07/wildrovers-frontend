const fs = require('fs');
const path = require('path');

const srcDir = 'd:\\Code\\wordpress\\web\\app\\themes\\wrw\\files';
const destDir = 'd:\\Code\\wildrovers-frontend\\src\\images';

const filesToCopy = ['TSAT_small.webp', 'Legion1_small.webp', 'WRW_small.webp'];

filesToCopy.forEach(file => {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  try {
    fs.copyFileSync(src, dest);
    console.log(`Successfully copied ${file} to ${dest}`);
  } catch (err) {
    console.error(`Failed to copy ${file}:`, err);
  }
});
