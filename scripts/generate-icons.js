const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZES = [16, 32, 48, 64, 128, 256, 512, 1024];
const CONTENT_RATIO = 0.8;
const CORNER_RATIO = 0.2237;
const ICONS_DIR = path.join(__dirname, '..', 'electron', 'assets', 'icons');

/** Скруглённый прямоугольник (roundRect или arcTo-fallback) */
function roundRectPath(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.arcTo(x + w, y, x + w, y + rad, rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.arcTo(x + w, y + h, x + w - rad, y + h, rad);
  ctx.lineTo(x + rad, y + h);
  ctx.arcTo(x, y + h, x, y + h - rad, rad);
  ctx.lineTo(x, y + rad);
  ctx.arcTo(x, y, x + rad, y, rad);
  ctx.closePath();
}

/** Градиентный фон и радиальный блик */
function drawBackground(ctx, x, y, s) {
  const r = s * CORNER_RATIO;
  const cx = x + s / 2;
  const grad = ctx.createLinearGradient(x, y, x + s, y + s);
  grad.addColorStop(0, '#3d8bff');
  grad.addColorStop(1, '#0a4fc2');
  ctx.fillStyle = grad;
  roundRectPath(ctx, x, y, s, s, r);
  ctx.fill();
  ctx.save();
  roundRectPath(ctx, x, y, s, s, r);
  ctx.clip();
  const hl = ctx.createRadialGradient(cx, y - s * 0.1, 0, cx, y - s * 0.1, s * 0.9);
  hl.addColorStop(0, 'rgba(255, 255, 255, 0.28)');
  hl.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = hl;
  ctx.fillRect(x, y, s, s);
  ctx.restore();
}

/** Ряд скруглённых блоков */
function drawContainerRow(ctx, x, y, count, u, g, color) {
  const br = u * 0.22;
  ctx.fillStyle = color;
  for (let i = 0; i < count; i++) {
    roundRectPath(ctx, x + i * (u + g), y, u, u, br);
    ctx.fill();
  }
}

/** Пирамида контейнеров (полная или упрощённая) */
function drawContainers(ctx, x, y, s, size) {
  const cx = x + s / 2;
  const cy = y + s / 2;
  if (size <= 32) {
    const u = s * 0.30;
    const g = s * 0.06;
    const pw = 2 * u + g;
    const ph = 2 * u + g;
    const baseX = cx - pw / 2;
    const topY = cy - ph / 2;
    drawContainerRow(ctx, baseX, topY + u + g, 2, u, g, 'rgba(255,255,255,0.96)');
    drawContainerRow(ctx, baseX + (u + g) / 2, topY, 1, u, g, '#bfe0ff');
    return;
  }
  const u = s * 0.19;
  const g = s * 0.035;
  const pw = 3 * u + 2 * g;
  const ph = 3 * u + 2 * g;
  const baseX = cx - pw / 2;
  const topY = cy - ph / 2;
  ctx.shadowColor = 'rgba(4, 30, 90, 0.28)';
  ctx.shadowBlur = s * 0.03;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = s * 0.012;
  drawContainerRow(ctx, baseX, topY + 2 * (u + g), 3, u, g, 'rgba(255,255,255,0.96)');
  drawContainerRow(ctx, baseX + (u + g) / 2, topY + u + g, 2, u, g, 'rgba(255,255,255,0.96)');
  drawContainerRow(ctx, baseX + u + g, topY, 1, u, g, '#bfe0ff');
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

/** Генерация PNG-буфера для заданного размера */
function createPNGIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  const s = size * CONTENT_RATIO;
  const offset = (size - s) / 2;
  drawBackground(ctx, offset, offset, s);
  drawContainers(ctx, offset, offset, s, size);
  return canvas.toBuffer('image/png');
}

/** Запись всех иконок в ICONS_DIR */
function main() {
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }
  for (const size of SIZES) {
    const buf = createPNGIcon(size);
    const name = `icon-${size}x${size}.png`;
    fs.writeFileSync(path.join(ICONS_DIR, name), buf);
    console.log(`icon-${size}x${size}.png`);
  }
  fs.writeFileSync(path.join(ICONS_DIR, 'icon.png'), createPNGIcon(512));
  console.log('icon.png');
}

main();
