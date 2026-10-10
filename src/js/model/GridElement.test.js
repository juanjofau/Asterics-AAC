// Follow the same manual mocks used by the existing model-related Jest tests.
// In particular, objectmodel's manual mock implements the static API (defaults/Array)
// that model modules call while they are being imported.
jest.mock('../externals/objectmodel');
jest.mock('../util/modelUtil');
jest.mock('../service/data/localStorageService');

import { GridElement } from './GridElement';

describe('GridElement border width', () => {
    const colorConfig = { borderWidth: 0.45 };

    test('inherits the global width when no individual value is set', () => {
        expect(GridElement.getBorderWidthPct({}, colorConfig)).toBe(0.45);
        expect(GridElement.getBorderWidthPct({ borderWidthPct: null }, colorConfig)).toBe(0.45);
        expect(GridElement.getBorderWidthPct({ borderWidthPct: undefined }, colorConfig)).toBe(0.45);
    });

    test('uses an individual width, including an explicit zero', () => {
        expect(GridElement.getBorderWidthPct({ borderWidthPct: 0.8 }, colorConfig)).toBe(0.8);
        expect(GridElement.getBorderWidthPct({ borderWidthPct: 0 }, colorConfig)).toBe(0);
    });

    test('persists the explicit zero in serialized cell data', () => {
        const element = new GridElement({ borderWidthPct: 0 });
        const savedElement = JSON.parse(JSON.stringify(element));
        expect(savedElement.borderWidthPct).toBe(0);
    });

    test('persists an individual width in serialized cell data', () => {
        const element = new GridElement({ borderWidthPct: 0.8 });
        const savedElement = JSON.parse(JSON.stringify(element));
        expect(savedElement.borderWidthPct).toBe(0.8);
    });

    test('leaves the property absent when a cell inherits the global width', () => {
        const element = new GridElement({});
        const savedElement = JSON.parse(JSON.stringify(element));
        expect(savedElement.borderWidthPct).toBeUndefined();
        expect(GridElement.getBorderWidthPct(savedElement, colorConfig)).toBe(0.45);
    });
});
