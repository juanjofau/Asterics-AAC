import { GridElement } from './GridElement.js';

// Follow the existing unit-test convention: use the project's ObjectModel mock and
// mock browser storage so the test exercises GridElement without bootstrapping app settings.
jest.mock('../externals/objectmodel');
jest.mock('../service/data/localStorageService');

describe('GridElement border width persistence', () => {
    test('keeps an explicit zero border width through JSON save/load', () => {
        const element = new GridElement({ id: 'border-test', borderWidthPct: 0, actions: [] });
        const loaded = new GridElement(JSON.parse(JSON.stringify(element)));
        expect(loaded.borderWidthPct).toBe(0);
    });

    test('keeps a custom border width through JSON save/load', () => {
        const element = new GridElement({ id: 'custom-border-test', borderWidthPct: 0.55, actions: [] });
        const loaded = new GridElement(JSON.parse(JSON.stringify(element)));
        expect(loaded.borderWidthPct).toBe(0.55);
    });

    test('legacy elements without a custom width remain unset', () => {
        const element = new GridElement({ id: 'legacy-border-test', actions: [] });
        expect(element.borderWidthPct === undefined || element.borderWidthPct === null).toBe(true);
    });
});
