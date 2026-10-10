import { GridElement } from './GridElement.js';

describe('GridElement border width persistence', () => {
    test('keeps an explicit zero border width through JSON save/load', () => {
        const element = new GridElement({ id: 'border-test', borderWidthPct: 0 });
        const loaded = new GridElement(JSON.parse(JSON.stringify(element)));
        expect(loaded.borderWidthPct).toBe(0);
    });

    test('legacy elements without a custom width remain unset', () => {
        const element = new GridElement({ id: 'legacy-border-test' });
        expect(element.borderWidthPct === undefined || element.borderWidthPct === null).toBe(true);
    });
});
