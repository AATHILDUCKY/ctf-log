import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

const MAX_BYTES = 30 * 1024;
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'branding');

export async function saveOptimizedBrandLogo(file: File) {
  const input = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(uploadDir, { recursive: true });

  for (const width of [512, 420, 320, 240, 180, 140, 120, 96, 72]) {
    for (const quality of [84, 74, 64, 54, 46, 38, 32, 26, 20]) {
      const output = await sharp(input)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toBuffer();

      if (output.byteLength <= MAX_BYTES) {
        const filename = `${randomUUID()}.webp`;
        await fs.writeFile(path.join(uploadDir, filename), output);
        return {
          url: `/uploads/branding/${filename}`,
          size: output.byteLength,
        };
      }
    }
  }

  throw new Error('Logo could not be compressed under 30 KB. Use a simpler icon-style image.');
}
