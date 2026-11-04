import { localStorageService } from './data/localStorageService';
import { dataService } from './data/dataService';

let statisticsService = {};
let STORAGE_KEY_PREFIX = 'AG_USAGE_STATISTICS_';

function getStorageKey() {
    let username = dataService.getCurrentUser() || 'local';
    return STORAGE_KEY_PREFIX + encodeURIComponent(username);
}

function getStoredStats() {
    let storedStats = localStorageService.get(getStorageKey());
    if (!storedStats) {
        return {
            enabled: false,
            gridOpens: {},
            cellPresses: {}
        };
    }
    try {
        let stats = JSON.parse(storedStats);
        return {
            enabled: !!stats.enabled,
            gridOpens: stats.gridOpens || {},
            cellPresses: stats.cellPresses || {}
        };
    } catch (error) {
        log.warn('could not read usage statistics from local storage', error);
        return {
            enabled: false,
            gridOpens: {},
            cellPresses: {}
        };
    }
}

function saveStats(stats) {
    localStorageService.saveJSON(getStorageKey(), stats);
}

statisticsService.init = function () {
    return Promise.resolve();
};

statisticsService.getStats = function () {
    return Promise.resolve(getStoredStats());
};

statisticsService.setEnabled = function (enabled) {
    let stats = getStoredStats();
    stats.enabled = !!enabled;
    saveStats(stats);
    return Promise.resolve();
};

statisticsService.recordGridOpen = function (gridId) {
    if (!gridId) return Promise.resolve();
    let stats = getStoredStats();
    if (!stats.enabled) return Promise.resolve();
    stats.gridOpens[gridId] = (stats.gridOpens[gridId] || 0) + 1;
    saveStats(stats);
    return Promise.resolve();
};

statisticsService.recordCellPress = function (gridId, cellId) {
    if (!gridId || !cellId) return Promise.resolve();
    let stats = getStoredStats();
    if (!stats.enabled) return Promise.resolve();
    let key = gridId + ':' + cellId;
    stats.cellPresses[key] = (stats.cellPresses[key] || 0) + 1;
    saveStats(stats);
    return Promise.resolve();
};

statisticsService.reset = function (type) {
    let stats = getStoredStats();
    if (type === 'grids' || type === 'all') {
        stats.gridOpens = {};
    }
    if (type === 'cells' || type === 'all') {
        stats.cellPresses = {};
    }
    saveStats(stats);
    return Promise.resolve();
};

export { statisticsService };
