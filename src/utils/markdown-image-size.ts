import type { HastPluginDefinition } from 'satteri';
import { publicImageSize } from './image-size';

/**
 * Sätteri hast plugin: Markdown images from `public/` get intrinsic
 * width/height (prevents layout shift) plus lazy loading. Remote or unknown
 * images are left unchanged.
 */
export const publicImageSizePlugin: HastPluginDefinition = {
  name: 'public-image-size',
  element: {
    filter: ['img'],
    visit(node, ctx) {
      const props = node.properties ?? {};
      if (typeof props.src !== 'string') return;
      const size = props.width || props.height ? undefined : publicImageSize(props.src);
      if (size) {
        ctx.setProperty(node, 'width', size.width);
        ctx.setProperty(node, 'height', size.height);
      }
      if (!props.loading) ctx.setProperty(node, 'loading', 'lazy');
      if (!props.decoding) ctx.setProperty(node, 'decoding', 'async');
    },
  },
};
