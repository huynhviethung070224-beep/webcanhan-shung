import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import sharp from 'sharp';
import { imageSize, publicImageSize } from '../../src/utils/image-size.ts';

describe('image size reader', () => {
  it('reads real PNG and WebP files from public/', () => {
    assert.deepEqual(publicImageSize('/projects/library-management-system/erd.png'), { width: 2254, height: 1716 });
    assert.deepEqual(publicImageSize('/projects/dragon-go/home.webp'), { width: 1600, height: 962 });
  });

  it('agrees with sharp for JPEG, GIF, lossy/lossless WebP and PNG', async () => {
    const base = sharp({ create: { width: 37, height: 21, channels: 3, background: '#cfe' } });
    for (const [label, buf] of [
      ['jpeg', await base.clone().jpeg().toBuffer()],
      ['gif', await base.clone().gif().toBuffer()],
      ['webp lossy', await base.clone().webp().toBuffer()],
      ['webp lossless', await base.clone().webp({ lossless: true }).toBuffer()],
      ['png', await base.clone().png().toBuffer()],
    ] as const) {
      assert.deepEqual(imageSize(buf), { width: 37, height: 21 }, label);
    }
  });

  it('reads SVG size from attributes or viewBox', () => {
    assert.deepEqual(imageSize(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="20"></svg>')), { width: 40, height: 20 });
    assert.deepEqual(imageSize(Buffer.from('<svg viewBox="0 0 64 32"></svg>')), { width: 64, height: 32 });
    assert.ok(publicImageSize('/favicon.svg'));
    assert.ok(readFileSync('public/favicon.svg').length > 0);
  });

  it('returns undefined for unknown, remote, missing, or escaping paths', () => {
    assert.equal(imageSize(Buffer.from('not an image')), undefined);
    assert.equal(publicImageSize('https://example.com/x.png'), undefined);
    assert.equal(publicImageSize('/missing.png'), undefined);
    assert.equal(publicImageSize('/../package.json'), undefined);
  });
});
