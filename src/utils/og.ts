import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { site } from '../config/site';

const WIDTH = 1200;
const HEIGHT = 630;

const colors = {
  bg: '#111411',
  text: '#F4F6ED',
  muted: '#B0B5B0',
  accent: '#D5F78B',
  border: '#2B2F2B',
};

let fontsPromise: Promise<{ manrope600: Buffer; manrope500: Buffer; serifItalic: Buffer }> | undefined;

async function loadFonts() {
  fontsPromise ??= (async () => {
    // Resolve through the package exports map so the path is valid from the bundled build output too.
    const require = createRequire(import.meta.url);
    const [manrope600, manrope500, serifItalic] = await Promise.all([
      readFile(require.resolve('@fontsource/manrope/files/manrope-latin-600-normal.woff')),
      readFile(require.resolve('@fontsource/manrope/files/manrope-latin-500-normal.woff')),
      readFile(require.resolve('@fontsource/instrument-serif/files/instrument-serif-latin-400-italic.woff')),
    ]);
    return { manrope600, manrope500, serifItalic };
  })();
  return fontsPromise;
}

export interface OgInput {
  /** Small label above the title, e.g. "Project" or "Article". */
  kind: string;
  title: string;
  subtitle?: string;
}

/** Build a 1200x630 PNG with the owner's identity plus the page title. */
export async function renderOgImage(input: OgInput): Promise<Buffer> {
  const fonts = await loadFonts();
  const titleSize = input.title.length > 40 ? 56 : input.title.length > 24 ? 68 : 80;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: colors.bg,
          color: colors.text,
          fontFamily: 'Manrope',
          position: 'relative',
        },
        children: [
          // orbit motif
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                right: '-180px',
                top: '-120px',
                width: '620px',
                height: '620px',
                borderRadius: '50%',
                border: `1px solid ${colors.border}`,
                display: 'flex',
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                right: '-40px',
                top: '20px',
                width: '340px',
                height: '340px',
                borderRadius: '50%',
                border: `1px dashed ${colors.accent}`,
                opacity: 0.45,
                display: 'flex',
              },
            },
          },
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                right: '126px',
                top: '14px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: colors.accent,
                display: 'flex',
              },
            },
          },
          // top row
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '16px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { width: '10px', height: '10px', borderRadius: '50%', background: colors.accent, display: 'flex' },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '22px', letterSpacing: '0.12em', color: colors.muted, textTransform: 'uppercase' },
                    children: input.kind,
                  },
                },
              ],
            },
          },
          // title block
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '920px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { fontSize: `${titleSize}px`, fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.03em' },
                    children: input.title,
                  },
                },
                input.subtitle
                  ? {
                      type: 'div',
                      props: {
                        style: { fontSize: '26px', color: colors.muted, lineHeight: 1.4, fontWeight: 500 },
                        children: input.subtitle,
                      },
                    }
                  : null,
              ],
            },
          },
          // identity row
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                paddingTop: '28px',
                borderTop: `1px solid ${colors.border}`,
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'baseline', gap: '12px', fontSize: '30px', fontWeight: 600 },
                    children: [
                      { type: 'span', props: { children: site.fullName } },
                      {
                        type: 'span',
                        props: {
                          style: { fontFamily: 'Instrument Serif', fontStyle: 'italic', fontWeight: 400, color: colors.accent, fontSize: '34px' },
                          children: `(${site.nickname})`,
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { fontSize: '22px', color: colors.muted },
                    children: new URL(site.productionOrigin).host,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'Manrope', data: fonts.manrope600, weight: 600, style: 'normal' },
        { name: 'Manrope', data: fonts.manrope500, weight: 500, style: 'normal' },
        { name: 'Instrument Serif', data: fonts.serifItalic, weight: 400, style: 'italic' },
      ],
    },
  );

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng();
  return Buffer.from(png);
}
