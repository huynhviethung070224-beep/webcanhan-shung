import { existsSync, readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';

export interface ImageSize {
  width: number;
  height: number;
}

/** Intrinsic size of an image in `public/` (PNG, JPEG, WebP, GIF, SVG), or undefined if unknown. */
export function publicImageSize(src: string): ImageSize | undefined {
  if (!src.startsWith('/') || src.startsWith('//')) return undefined;
  const root = resolve(process.cwd(), 'public');
  const file = resolve(root, `.${decodeURIComponent(src.replace(/[?#].*$/, ''))}`);
  if (!file.startsWith(`${root}${sep}`) || !existsSync(file)) return undefined;
  return imageSize(readFileSync(file));
}

export function imageSize(buf: Buffer): ImageSize | undefined {
  const ascii = (start: number, end: number) => buf.toString('latin1', start, end);
  // PNG: IHDR width/height
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // GIF
  if (ascii(0, 3) === 'GIF') return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
  // WebP
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') {
    const chunk = ascii(12, 16);
    if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    if (chunk === 'VP8L') {
      const bits = buf.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === 'VP8X') return { width: buf.readUIntLE(24, 3) + 1, height: buf.readUIntLE(27, 3) + 1 };
    return undefined;
  }
  // JPEG: walk segments to the first SOFn marker
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let offset = 2;
    while (offset + 9 < buf.length) {
      if (buf[offset] !== 0xff) return undefined;
      const marker = buf[offset + 1]!;
      const length = buf.readUInt16BE(offset + 2);
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
        return { width: buf.readUInt16BE(offset + 7), height: buf.readUInt16BE(offset + 5) };
      }
      offset += 2 + length;
    }
    return undefined;
  }
  // SVG: explicit width/height, else viewBox
  const head = ascii(0, Math.min(buf.length, 2048));
  const svg = /<svg\b[^>]*>/i.exec(head)?.[0];
  if (svg) {
    const num = (name: string) => Number(new RegExp(`\\s${name}="([\\d.]+)(px)?"`).exec(svg)?.[1]);
    const [w, h] = [num('width'), num('height')];
    if (w > 0 && h > 0) return { width: Math.round(w), height: Math.round(h) };
    const box = /viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/.exec(svg);
    if (box) return { width: Math.round(Number(box[1])), height: Math.round(Number(box[2])) };
  }
  return undefined;
}
