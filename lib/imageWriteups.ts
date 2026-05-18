import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

const MAX_BYTES = 35 * 1024;
const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'writeups');

export async function saveOptimizedWriteupImage(file: File) {
  const input = Buffer.from(await file.arrayBuffer());
  await fs.mkdir(uploadDir, { recursive: true });

  for (const width of [1200, 980, 760, 560, 420, 320]) {
    for (const quality of [82, 74, 66, 58, 50, 42, 34, 28]) {
      const output = await sharp(input)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality, effort: 6 })
        .toBuffer();

      if (output.byteLength <= MAX_BYTES) {
        const filename = `${randomUUID()}.webp`;
        await fs.writeFile(path.join(uploadDir, filename), output);
        return {
          url: `/uploads/writeups/${filename}`,
          size: output.byteLength,
        };
      }
    }
  }

  throw new Error('Image could not be compressed under 35 KB. Try a simpler screenshot or crop.');
}
