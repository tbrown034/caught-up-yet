import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFile, mkdir } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// SVG source for the favicon
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#bgGrad)"/>
  <path
    d="M 340 140 A 140 140 0 1 0 340 372"
    stroke="white"
    stroke-width="48"
    stroke-linecap="round"
    fill="none"
  />
  <path
    d="M 300 280 L 340 320 L 400 240"
    stroke="white"
    stroke-width="40"
    stroke-linecap="round"
    stroke-linejoin="round"
    fill="none"
  />
</svg>`;

async function generateFavicon() {
  console.log("Generating favicon...");

  // Create temporary directory
  const tempDir = join(rootDir, ".temp-icons");
  try {
    await mkdir(tempDir, { recursive: true });
  } catch {
    // Directory exists
  }

  // Generate PNG at different sizes for ICO
  const sizes = [16, 32, 48];
  const pngBuffers = [];

  for (const size of sizes) {
    const pngPath = join(tempDir, `icon-${size}.png`);
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(pngPath);
    pngBuffers.push(pngPath);
    console.log(`Created ${size}x${size} PNG`);
  }

  // Convert to ICO
  const icoBuffer = await pngToIco(pngBuffers);
  const faviconPath = join(rootDir, "app", "favicon.ico");
  await writeFile(faviconPath, icoBuffer);
  console.log(`Created favicon.ico at ${faviconPath}`);

  // Clean up temp files
  const { rm } = await import("fs/promises");
  await rm(tempDir, { recursive: true, force: true });
  console.log("Cleaned up temporary files");

  console.log("Done!");
}

generateFavicon().catch(console.error);
