import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "App_icon_with_engram_20260918141331.jpeg");
const outDir = join(root, "icons");
mkdirSync(outDir, { recursive: true });

const sizes = [16, 48, 128];
for (const size of sizes) {
  const out = join(outDir, `icon${size}.png`);
  await sharp(src)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(out);
  console.log(`wrote ${out}`);
}
