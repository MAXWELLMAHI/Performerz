import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const publicDir = path.resolve('public');
const files = fs.readdirSync(publicDir);

async function compressAll() {
  let totalBefore = 0;
  let totalAfter = 0;

  console.log('Starting image compression in public/...\n');

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) continue;

    const filePath = path.join(publicDir, file);
    const stat = fs.statSync(filePath);
    const sizeBefore = stat.size;
    totalBefore += sizeBefore;

    const tempPath = path.join(publicDir, `_temp_${file}`);

    try {
      const image = sharp(filePath);
      const metadata = await image.metadata();

      let pipeline = sharp(filePath);

      // Downscale if ridiculously large (e.g. > 2000px wide)
      if (metadata.width && metadata.width > 2000) {
        pipeline = pipeline.resize({ width: 2000, withoutEnlargement: true });
      }

      if (ext === '.jpg' || ext === '.jpeg') {
        await pipeline
          .jpeg({ quality: 82, mozjpeg: true, progressive: true })
          .toFile(tempPath);
      } else if (ext === '.png') {
        await pipeline
          .png({ quality: 84, compressionLevel: 9, progressive: true })
          .toFile(tempPath);
      } else if (ext === '.webp') {
        await pipeline
          .webp({ quality: 82, effort: 6 })
          .toFile(tempPath);
      }

      const sizeAfter = fs.statSync(tempPath).size;

      // Only replace if size was reduced or significantly optimized
      if (sizeAfter < sizeBefore) {
        fs.unlinkSync(filePath);
        fs.renameSync(tempPath, filePath);
        totalAfter += sizeAfter;
        const savedPercent = Math.round(((sizeBefore - sizeAfter) / sizeBefore) * 100);
        console.log(`✔ ${file.padEnd(32)}: ${(sizeBefore / 1024).toFixed(0)} KB -> ${(sizeAfter / 1024).toFixed(0)} KB (-${savedPercent}%)`);
      } else {
        fs.unlinkSync(tempPath);
        totalAfter += sizeBefore;
        console.log(`- ${file.padEnd(32)}: Already optimal (${(sizeBefore / 1024).toFixed(0)} KB)`);
      }
    } catch (err) {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      totalAfter += sizeBefore;
      console.warn(`✖ Failed to compress ${file}:`, err.message);
    }
  }

  const totalSavedMB = ((totalBefore - totalAfter) / (1024 * 1024)).toFixed(2);
  const totalSavedPercent = Math.round(((totalBefore - totalAfter) / totalBefore) * 100);
  console.log(`\n======================================================`);
  console.log(`Total Before: ${(totalBefore / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Total After : ${(totalAfter / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Saved       : ${totalSavedMB} MB (-${totalSavedPercent}%)`);
  console.log(`======================================================`);
}

compressAll();
