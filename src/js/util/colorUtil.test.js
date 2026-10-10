import { colorUtil } from './colorUtil.js';

jest.mock('../model/MetaData', () => ({ MetaData: jest.fn() }));
jest.mock('../model/GridElement', () => ({
    GridElement: {
        ELEMENT_TYPE_UI_FILLER: 'ELEMENT_TYPE_UI_FILLER',
        ELEMENT_TYPE_DYNAMIC_GRID_PLACEHOLDER: 'ELEMENT_TYPE_DYNAMIC_GRID_PLACEHOLDER',
        ELEMENT_TYPE_PREDICTION: 'ELEMENT_TYPE_PREDICTION',
        ELEMENT_TYPE_LIVE: 'ELEMENT_TYPE_LIVE'
    }
}));
jest.mock('../model/ColorConfig', () => ({
    ColorConfig: {
        COLOR_MODE_BACKGROUND: 'COLOR_MODE_BACKGROUND',
        COLOR_MODE_BORDER: 'COLOR_MODE_BORDER',
        COLOR_MODE_BOTH: 'COLOR_MODE_BOTH',
        BORDER_WIDTH_BG_COLORED: 0.1
    }
}));
jest.mock('./fontUtil', () => ({ fontUtil: {} }));

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
        expect(colorUtil.getBorderWidthPct({}, {})).toBe(0.1);
    });
});
