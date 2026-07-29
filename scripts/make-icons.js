// Generates the PWA home-screen icons (a purple rounded square with a white
// music-note glyph) without needing any image-editing tools or native deps.
import { PNG } from 'pngjs';
import { writeFileSync, mkdirSync } from 'node:fs';

const BG = [108, 92, 231]; // #6c5ce7
const FG = [255, 255, 255];

function drawIcon(size) {
  const png = new PNG({ width: size, height: size });
  const cx = size / 2;
  const cy = size / 2;

  // Note geometry, scaled to icon size.
  const headR = size * 0.11;
  const stemW = size * 0.06;
  const stemH = size * 0.34;
  const leftHeadX = cx - size * 0.13;
  const rightHeadX = cx + size * 0.13;
  const headY = cy + size * 0.16;
  const stemTopY = headY - stemH;
  const beamH = size * 0.09;

  const cornerR = size * 0.22;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;

      // Rounded-square background mask.
      let inside = true;
      const cornerDist = (px, py) => Math.hypot(x - px, y - py);
      if (x < cornerR && y < cornerR && cornerDist(cornerR, cornerR) > cornerR) inside = false;
      if (x > size - cornerR && y < cornerR && cornerDist(size - cornerR, cornerR) > cornerR) inside = false;
      if (x < cornerR && y > size - cornerR && cornerDist(cornerR, size - cornerR) > cornerR) inside = false;
      if (x > size - cornerR && y > size - cornerR && cornerDist(size - cornerR, size - cornerR) > cornerR) inside = false;

      let [r, g, b] = inside ? BG : [0, 0, 0];
      let a = inside ? 255 : 0;

      // Two note heads (filled circles).
      if (Math.hypot(x - leftHeadX, y - headY) <= headR || Math.hypot(x - rightHeadX, y - headY) <= headR) {
        [r, g, b] = FG;
      }
      // Stem connecting the right head upward.
      if (x >= rightHeadX - stemW / 2 && x <= rightHeadX + stemW / 2 && y >= stemTopY && y <= headY) {
        [r, g, b] = FG;
      }
      // Left stem (shorter, just enough to meet the beam).
      if (x >= leftHeadX - stemW / 2 && x <= leftHeadX + stemW / 2 && y >= stemTopY && y <= headY) {
        [r, g, b] = FG;
      }
      // Beam joining the two stems near the top.
      if (x >= leftHeadX - stemW / 2 && x <= rightHeadX + stemW / 2 && y >= stemTopY && y <= stemTopY + beamH) {
        [r, g, b] = FG;
      }

      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = a;
    }
  }
  return png;
}

mkdirSync('public/icons', { recursive: true });
for (const size of [192, 512]) {
  const png = drawIcon(size);
  writeFileSync(`public/icons/icon-${size}.png`, PNG.sync.write(png));
  console.log(`wrote public/icons/icon-${size}.png`);
}
