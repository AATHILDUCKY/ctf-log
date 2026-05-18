import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

const MAX_BYTES = 30 * 1024;
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'ads');

export async function saveOptimizedAdImage(file: File) {
  const input = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(uploadDir, { recursive: true });

  for (const width of [900, 720, 560, 420, 320]) {
    for (const quality of [78, 68, 58, 48, 38, 30]) {
      const output = await sharp(input)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toBuffer();

      if (output.byteLength <= MAX_BYTES) {
        const filename = `${randomUUID()}.webp`;
        await fs.writeFile(path.join(uploadDir, filename), output);
        return {
          url: `/uploads/ads/${filename}`,
          size: output.byteLength,
        };
      }
    }
  }

  throw new Error('Image could not be compressed under 30 KB. Try a simpler or smaller image.');
}
