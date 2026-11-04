<template>
    <section class="statistics-panel">
        <div class="statistics-toggle">
            <label for="statisticsEnabled">
                <input id="statisticsEnabled" type="checkbox" :checked="enabled" @change="toggleEnabled"/>
                {{ $t('enableUsageStatistics') }}
            </label>
        </div>
        <div v-if="enabled">
            <nav class="statistics-tabs">
                <button :class="{active: activeTab === 'grids'}" @click="activeTab = 'grids'">{{ $t('gridStatistics') }}</button>
                <button :class="{active: activeTab === 'cells'}" @click="activeTab = 'cells'">{{ $t('cellStatistics') }}</button>
            </nav>
            <div v-if="activeTab === 'grids'">
                <div class="statistics-toolbar">
                    <input type="search" v-model="gridSearch" :placeholder="$t('searchGrids')"/>
                    <button @click="reset('grids')">{{ $t('resetGridStatistics') }}</button>
                </div>
                <table>
                    <thead><tr>
                        <th><button @click="sortGrids('label')">{{ $t('grid') }}</button></th>
                        <th><button @click="sortGrids('count')">{{ $t('openings') }}</button></th>
                    </tr></thead>
                    <tbody>
                        <tr v-for="grid in visibleGrids" :key="grid.id" :class="{selected: selectedGridId === grid.id}" @click="showGridCells(grid.id)" @keydown.enter="showGridCells(grid.id)" @keydown.space.prevent="showGridCells(grid.id)" tabindex="0" role="button">
                            <td>{{ getGridLabel(grid) }}</td>
                            <td>{{ gridOpens[grid.id] || 0 }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-if="activeTab === 'cells'">
                <div class="statistics-toolbar">
                    <label for="statisticsGrid">{{ $t('grid') }}</label>
                    <select id="statisticsGrid" v-model="selectedGridId">
                        <option value="">{{ $t('allGrids') }}</option>
                        <option v-for="grid in grids" :key="grid.id" :value="grid.id">{{ getGridLabel(grid) }}</option>
                    </select>
                    <input type="search" v-model="cellSearch" :placeholder="$t('searchCells')"/>
                    <button @click="reset('cells')">{{ $t('resetCellStatistics') }}</button>
                </div>
                <table>
                    <thead><tr>
                        <th><button @click="sortCells('label')">{{ $t('cell') }}</button></th>
                        <th><button @click="sortCells('grid')">{{ $t('grid') }}</button></th>
                        <th><button @click="sortCells('count')">{{ $t('presses') }}</button></th>
                    </tr></thead>
                    <tbody>
                        <tr v-for="cell in visibleCells" :key="cell.key" @click="$emit('open-grid', cell.grid.id)" @keydown.enter="$emit('open-grid', cell.grid.id)" @keydown.space.prevent="$emit('open-grid', cell.grid.id)" tabindex="0" role="button">
                            <td>{{ cell.label }}</td>
                            <td>{{ getGridLabel(cell.grid) }}</td>
                            <td>{{ cell.count }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <button class="reset-all" @click="reset('all')">{{ $t('resetAllStatistics') }}</button>
        </div>
    </section>
</template>

<script>
    import { statisticsService } from '../../js/service/statisticsService';
    import { i18nService } from '../../js/service/i18nService';

    export default {
        props: {
            grids: {
                type: Array,
                default: () => []
            }
        },
        data() {
            return {
                enabled: false,
                gridOpens: {},
                cellPresses: {},
                activeTab: 'grids',
                selectedGridId: '',
                gridSearch: '',
                cellSearch: '',
                gridDescending: true,
                cellDescending: true,
                cellCountDescending: true,
                gridSortBy: 'count',
                cellSortBy: 'count'
            };
        },
        computed: {
            visibleGrids() {
                let grids = this.grids.filter(grid => this.getGridLabel(grid).toLowerCase().includes(this.gridSearch.toLowerCase()));
                return grids.sort((a, b) => {
                    let diff = this.gridSortBy === 'label' ? this.getGridLabel(a).localeCompare(this.getGridLabel(b)) : (this.gridOpens[a.id] || 0) - (this.gridOpens[b.id] || 0);
                    return this.gridDescending ? -diff : diff;
                });
            },
            visibleCells() {
                let cells = [];
                for (let grid of this.grids) {
                    if (this.selectedGridId && this.selectedGridId !== grid.id) continue;
                    for (let element of grid.gridElements || []) {
                        let key = grid.id + ':' + element.id;
                        let count = this.cellPresses[key] || 0;
                        let label = i18nService.getTranslation(element.label) || '';
                        if (label.toLowerCase().includes(this.cellSearch.toLowerCase())) {
                            cells.push({key, grid, label, count});
                        }
                    }
                }
                return cells.sort((a, b) => {
                    let diff = 0;
                    if (this.cellSortBy === 'label') diff = a.label.localeCompare(b.label);
                    else if (this.cellSortBy === 'grid') diff = this.getGridLabel(a.grid).localeCompare(this.getGridLabel(b.grid));
                    else diff = a.count - b.count;
                    return this.cellDescending ? -diff : diff;
                });
            }
        },
        methods: {
            getGridLabel(grid) {
                return i18nService.getTranslation(grid.label) || '';
            },
            async reload() {
                let stats = await statisticsService.getStats();
                this.enabled = stats.enabled;
                this.gridOpens = stats.gridOpens;
                this.cellPresses = stats.cellPresses;
            },
            async toggleEnabled(event) {
                await statisticsService.setEnabled(event.target.checked);
                await this.reload();
            },
            sortGrids(key) {
                if (this.gridSortBy === key) this.gridDescending = !this.gridDescending;
                else {
                    this.gridSortBy = key;
                    this.gridDescending = key === 'count';
                }
            },
            sortCells(key) {
                if (this.cellSortBy === key) this.cellDescending = !this.cellDescending;
                else {
                    this.cellSortBy = key;
                    this.cellDescending = key === 'count';
                }
            },
            showGridCells(gridId) {
                this.selectedGridId = gridId;
                this.activeTab = 'cells';
            },
            async reset(type) {
                let message = type === 'all' ? i18nService.t('confirmResetAllStatistics') :
                    type === 'grids' ? i18nService.t('confirmResetGridStatistics') : i18nService.t('confirmResetCellStatistics');
                if (!confirm(message)) return;
                await statisticsService.reset(type);
                await this.reload();
            }
        },
        async mounted() {
            await this.reload();
        }
    };
</script>

<style scoped>
    .statistics-toggle {
        margin: 1em 0;
    }
    .statistics-tabs {
        display: flex;
        gap: 0.5em;
        margin-bottom: 1em;
    }
    .statistics-tabs button.active {
        font-weight: bold;
    }
    .statistics-toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.75em;
        margin: 1em 0;
    }
    .statistics-toolbar input[type='search'] {
        flex: 1;
        min-width: 140px;
    }
    .statistics-panel table {
        width: 100%;
        border-collapse: collapse;
    }
    .statistics-panel th,
    .statistics-panel td {
        padding: 0.5em;
        border-bottom: 1px solid #ddd;
        text-align: left;
    }
    .statistics-panel tbody tr {
        cursor: pointer;
    }
    .statistics-panel tbody tr.selected {
        background: #eee;
    }
    .reset-all {
        margin-top: 1em;
    }
</style>
