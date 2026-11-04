import PouchDB from 'PouchDB';
import { dataService } from './data/dataService';

let statisticsService = {};
let _db = null;
let _dbName = null;
let _initPromise = null;
let _writeQueue = Promise.resolve();

function getDatabaseName() {
    let username = dataService.getCurrentUser() || 'local';
    username = username.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return 'asterics-aac-statistics-' + username;
}

async function getDocument() {
    try {
        return await _db.get('usage-statistics');
    } catch (error) {
        if (error.status !== 404) {
            throw error;
        }
        return {
            _id: 'usage-statistics',
            enabled: false,
            gridOpens: {},
            cellPresses: {}
        };
    }
}

function updateDocument(updateFn) {
    _writeQueue = _writeQueue.then(async () => {
        let document = await getDocument();
        updateFn(document);
        try {
            await _db.put(document);
        } catch (error) {
            if (error.status !== 409) {
                throw error;
            }
            document = await getDocument();
            updateFn(document);
            await _db.put(document);
        }
    });
    return _writeQueue;
}

statisticsService.init = async function () {
    let databaseName = getDatabaseName();
    if (_db && _dbName === databaseName) {
        return _initPromise;
    }
    if (_db) {
        await _db.close();
    }
    _db = new PouchDB(databaseName, { auto_compaction: true });
    _dbName = databaseName;
    _initPromise = _db.info();
    await _initPromise;
};

statisticsService.getStats = async function () {
    await statisticsService.init();
    let document = await getDocument();
    return {
        enabled: !!document.enabled,
        gridOpens: document.gridOpens || {},
        cellPresses: document.cellPresses || {}
    };
};

statisticsService.setEnabled = async function (enabled) {
    await statisticsService.init();
    return updateDocument(document => {
        document.enabled = !!enabled;
    });
};

statisticsService.recordGridOpen = async function (gridId) {
    if (!gridId) return;
    await statisticsService.init();
    if (!(await getDocument()).enabled) return;
    return updateDocument(document => {
        if (document.enabled) {
            document.gridOpens[gridId] = (document.gridOpens[gridId] || 0) + 1;
        }
    });
};

statisticsService.recordCellPress = async function (gridId, cellId) {
    if (!gridId || !cellId) return;
    await statisticsService.init();
    if (!(await getDocument()).enabled) return;
    return updateDocument(document => {
        if (document.enabled) {
            let key = gridId + ':' + cellId;
            document.cellPresses[key] = (document.cellPresses[key] || 0) + 1;
        }
    });
};

statisticsService.reset = async function (type) {
    await statisticsService.init();
    return updateDocument(document => {
        if (type === 'grids' || type === 'all') {
            document.gridOpens = {};
        }
        if (type === 'cells' || type === 'all') {
            document.cellPresses = {};
        }
    });
};

export { statisticsService };
