import { colorUtil } from './colorUtil.js';
import { ColorConfig } from '../model/ColorConfig.js';

describe('colorUtil.getBorderWidthPct', () => {
    const metadata = { colorConfig: { borderWidth: 0.65 } };

    test('inherits the global width when the per-element width is absent', () => {
        expect(colorUtil.getBorderWidthPct({}, metadata)).toBe(0.65);
    });

    test('uses a custom per-element width', () => {
        expect(colorUtil.getBorderWidthPct({ borderWidthPct: 0.4 }, metadata)).toBe(0.4);
    });

    test('treats zero as an explicit width, not as inheritance', () => {
        expect(colorUtil.getBorderWidthPct({ borderWidthPct: 0 }, metadata)).toBe(0);
    });

    test('null clears the custom width and inherits the global width', () => {
        expect(colorUtil.getBorderWidthPct({ borderWidthPct: null }, metadata)).toBe(0.65);
    });

    test('uses the model default when metadata has no global width', () => {
        expect(colorUtil.getBorderWidthPct({}, {})).toBe(ColorConfig.BORDER_WIDTH_BG_COLORED);
    });
});
