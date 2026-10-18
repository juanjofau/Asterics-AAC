<template>
    <div class="box" id="gridView" v-cloak>
        <header class="srow header" role="toolbar" v-if="metadata" v-show="!metadata.fullscreen && !metadata.locked">
            <header-icon class="left" v-show="!metadata.locked"></header-icon>
            <div class="btn-group left">
                <button tabindex="30" v-show="!metadata.locked" @click="toEditGrid()" class="spaced small" :aria-label="$t('editingOn')"><i class="fas fa-pencil-alt"/> <span class="hide-mobile">{{ $t('editingOn') }}</span></button>
                <button tabindex="31" id="inputConfigButton" v-show="!metadata.locked" class="small" :aria-label="$t('inputOptions')"><i class="fas fa-cog"></i> <span class="hide-mobile">{{ $t('inputOptions') }}</span></button>
                <div id="inputConfigMenu"></div>
            </div>
            <button tabindex="34" v-show="metadata.locked" @click="unlock()" class="small" :aria-label="$t('unlock')">
                <i class="fas fa-unlock"></i>
                <span class="hide-mobile">{{ $t('unlock') }}</span>
                <span v-if="unlockCounter !== unlockCount">{{unlockCounter}}</span>
            </button>
            <button tabindex="34" v-show="!metadata.locked" @click="MainVue.showSearchModal()" class="spaced small" :aria-label="$t('fullscreen')" :title="$t('searchBtnTitle')"><i class="fas fa-search"/> <span class="hide-mobile">{{ $t('search') }}</span></button>
            <button tabindex="33" v-show="!metadata.locked" @click="lock()" class="small" :aria-label="$t('lock')">
                <i class="fas fa-lock"></i>
                <span class="hide-mobile">{{ $t('lock') }}</span>
            </button>
            <button tabindex="32" @click="systemActionService.enterFullscreen()" class="spaced small" :aria-label="$t('fullscreen')"><i class="fas fa-expand"/> <span class="hide-mobile">{{ $t('fullscreen') }}</span></button>

        </header>
        <div v-if="metadata && (metadata.locked || metadata.fullscreen)"
             class="floating-controls">
            <button v-if="!floatingControlsVisible"
                    type="button"
                    tabindex="30"
                    @click="showFloatingControls()"
                    class="floating-controls-trigger"
                    :aria-label="$t('show')"
                    :title="$t('show')">
                <span class="floating-controls-indicator"></span>
            </button>

            <template v-else>
                <button tabindex="30"
                        @click="showFloatingControls(); metadata.fullscreen ? systemActionService.exitFullscreen() : systemActionService.enterFullscreen()"
                        class="floating-control-button"
                        :aria-label="metadata.fullscreen ? $t('SYS_LEAVE_FULLSCREEN') : $t('SYS_ENTER_FULLSCREEN')"
                        :title="metadata.fullscreen ? $t('SYS_LEAVE_FULLSCREEN') : $t('SYS_ENTER_FULLSCREEN')">
                    <i :class="metadata.fullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
                </button>

                <button v-if="metadata.locked && !metadata.fullscreen"
                        tabindex="31"
                        @click="showFloatingControls(); unlock()"
                        class="floating-control-button"
                        :aria-label="$t('unlock')"
                        :title="$t('unlock')">
                    <i class="fas fa-unlock"></i>
                    <span v-if="unlockCounter !== unlockCount">{{unlockCounter}}</span>
                </button>
            </template>
        </div>
        <div class="srow content text-content" v-show="!renderGridData">
            <div class="grid-container grid-mask">
                <i class="fas fa-4x fa-spinner fa-spin" style="position: relative;"/>
            </div>
        </div>

        <huffman-input-modal v-if="showModal === modalTypes.MODAL_HUFFMAN" @close="showModal = null; reloadInputMethods();" />
        <direction-input-modal v-if="showModal === modalTypes.MODAL_DIRECTION" @close="showModal = null; reloadInputMethods();"/>
        <mouse-modal v-if="showModal === modalTypes.MODAL_MOUSE" @close="showModal = null; reloadInputMethods();"/>
        <scanning-modal v-if="showModal === modalTypes.MODAL_SCANNING" @close="showModal = null; reloadInputMethods();"/>
        <sequential-input-modal v-if="showModal === modalTypes.MODAL_SEQUENTIAL" @close="showModal = null; reloadInputMethods();"/>
        <unlock-modal v-if="showModal === modalTypes.MODAL_UNLOCK" @unlock="unlock(true)" @close="showModal = null;"/>

        <div class="srow content spaced" v-if="renderGridData && renderGridData.gridElements.length === 0">
            <div style="margin-top: 2em">
                <i18n path="noElementsClickToEnterEdit" tag="span">
                    <template v-slot:link>
                        <a :href="'#grid/edit/' + renderGridData.id">{{ $t('editingOn') }}</a>
                    </template>
                </i18n>
            </div>
        </div>
        <div class="srow content d-flex" v-if="showGrid && renderGridData && renderGridData.gridElements.length > 0" style="min-height: 0">
            <app-grid-display id="grid-container" :grid-data="renderGridData" :metadata="metadata" :elem-css-fn="(elem) => gridUtil.getElemBackgroundCss(elem, renderGridData, globalGridData, metadata.colorConfig.gridBackgroundColor)"/>
        </div>

        <aside class="debug-panel" aria-label="Diagnóstico de la aplicación">
            <div class="debug-panel-header">
                <strong>DEBUG · Prueba funcional</strong>
                <button type="button" class="debug-panel-collapse" @click="debugExpanded = !debugExpanded"
                        :aria-expanded="String(debugExpanded)" :title="debugExpanded ? 'Contraer diagnóstico' : 'Expandir diagnóstico'">
                    {{ debugExpanded ? '−' : '+' }}
                </button>
            </div>
            <div v-show="debugExpanded">
                <div class="debug-panel-tabs" role="tablist" aria-label="Tipo de diagnóstico">
                    <button type="button" :class="{ active: debugTab === 'general' }" @click="debugTab = 'general'">General</button>
                    <button type="button" :class="{ active: debugTab === 'grid' }" @click="debugTab = 'grid'">Tablero</button>
                </div>
                <div v-if="debugTab === 'general'" class="debug-panel-content">
                    <div class="debug-section-title">Pantalla y navegador</div>
                    <div class="debug-metric"><span>Pantalla informada</span><strong>{{ debugScreen.screenWidth }} × {{ debugScreen.screenHeight }} CSS px</strong></div>
                    <div class="debug-metric"><span>Área disponible de pantalla</span><strong>{{ debugScreen.availWidth }} × {{ debugScreen.availHeight }} CSS px</strong></div>
                    <div class="debug-metric"><span>Viewport</span><strong>{{ debugScreen.viewportWidth }} × {{ debugScreen.viewportHeight }} CSS px</strong></div>
                    <div class="debug-metric"><span>Densidad (DPR)</span><strong>{{ debugScreen.devicePixelRatio }}×</strong></div>
                    <div class="debug-metric"><span>Orientación</span><strong>{{ debugScreen.orientation }}</strong></div>
                    <div class="debug-metric"><span>Conexión</span><strong>{{ debugScreen.online ? 'Conectado' : 'Sin conexión' }}</strong></div>
                    <div class="debug-metric"><span>Pantalla completa</span><strong>{{ debugScreen.fullscreen ? 'Sí' : 'No' }}</strong></div>
                    <div class="debug-section-title">Región actual del tablero</div>
                    <div class="debug-metric"><span>Área renderizada</span><strong>{{ debugGridArea.width }} × {{ debugGridArea.height }} CSS px</strong></div>
                    <div class="debug-metric"><span>Ruta de la aplicación</span><strong class="debug-wrap">{{ debugScreen.path }}</strong></div>
                    <p class="debug-note">Las medidas de pantalla y viewport están expresadas en píxeles CSS, no necesariamente en píxeles físicos.</p>
                </div>
                <div v-else class="debug-panel-content">
                    <div class="debug-section-title">Tablero actual</div>
                    <div class="debug-metric"><span>ID</span><strong class="debug-wrap">{{ renderGridData ? renderGridData.id : 'Cargando…' }}</strong></div>
                    <div class="debug-metric"><span>Filas × columnas</span><strong>{{ renderGridData ? renderGridData.rowCount + ' × ' + renderGridData.minColumnCount : '—' }}</strong></div>
                    <div class="debug-metric"><span>Elementos renderizados</span><strong>{{ debugGridStats.elements }}</strong></div>
                    <div class="debug-metric"><span>Elementos de relleno</span><strong>{{ debugGridStats.fillers }}</strong></div>
                    <div class="debug-metric"><span>Elementos con imagen</span><strong>{{ debugGridStats.images }}</strong></div>
                    <div class="debug-section-title">Imágenes en el DOM</div>
                    <div class="debug-metric"><span>Cargadas</span><strong>{{ debugImageStats.loaded }}</strong></div>
                    <div class="debug-metric"><span>Pendientes</span><strong>{{ debugImageStats.pending }}</strong></div>
                    <div class="debug-metric"><span>Fallidas</span><strong>{{ debugImageStats.failed }}</strong></div>
                    <div class="debug-metric"><span>Dimensiones naturales (muestra)</span><strong class="debug-wrap">{{ debugImageStats.dimensions.join(', ') || '—' }}</strong></div>
                    <div class="debug-section-title">Última apertura / carga</div>
                    <div class="debug-metric"><span>Inicio</span><strong>{{ debugLastLoad ? debugLastLoad.startedAt : '—' }}</strong></div>
                    <div class="debug-metric"><span>Preparación de datos</span><strong>{{ formatDebugMs(debugLastLoad && debugLastLoad.preparationMs) }}</strong></div>
                    <div class="debug-metric"><span>Hasta DOM actualizado</span><strong>{{ formatDebugMs(debugLastLoad && debugLastLoad.renderReadyMs) }}</strong></div>
                    <div class="debug-metric"><span>Inicialización posterior</span><strong>{{ formatDebugMs(debugLastLoad && debugLastLoad.initializationMs) }}</strong></div>
                    <div class="debug-metric"><span>Tiempo total medido</span><strong>{{ formatDebugMs(debugLastLoad && debugLastLoad.totalMs) }}</strong></div>
                    <div class="debug-panel-actions">
                        <button type="button" @click="refreshDebugMetrics()">Actualizar medidas</button>
                        <button type="button" @click="copyDebugReport()">Copiar informe</button>
                    </div>
                    <p class="debug-note">La medición de DOM actualizado no garantiza que todas las imágenes hayan terminado de decodificarse. Los tiempos son diagnósticos orientativos.</p>
                </div>
            </div>
        </aside>
    </div>
</template>

<script>
    import $ from '../../js/externals/jquery.js';
    import {L} from "../../js/util/lquery.js";
    import {actionService} from "../../js/service/actionService";
    import {dataService} from "../../js/service/data/dataService";
    import {areService} from "../../js/service/areService";
    import {Router} from "./../../js/router.js";
    import {MetaData} from "../../js/model/MetaData.js";
    import {urlParamService} from "../../js/service/urlParamService";

    import {Scanner} from "../../js/input/scanning.js";
    import {Hover} from "../../js/input/hovering.js";
    import {Clicker} from "../../js/input/clicking.js";
    import {HuffmanInput} from "../../js/input/huffmanInput";
    import {DirectionInput} from "../../js/input/directionInput";
    import {SequentialInput} from "../../js/input/sequentialInput";

    import HeaderIcon from '../../vue-components/components/headerIcon.vue'
    import {constants} from "../../js/util/constants";
    import {i18nService} from "../../js/service/i18nService";
    import {util} from "../../js/util/util";
    import ScanningModal from '../../vue-components/modals/input/scanningModal.vue'
    import MouseModal from "../modals/input/mouseModal.vue";
    import DirectionInputModal from "../modals/input/directionInputModal.vue";
    import HuffmanInputModal from "../modals/input/huffmanInputModal.vue";
    import SequentialInputModal from "../modals/input/sequentialInputModal.vue";
    import {speechService} from "../../js/service/speechService";
    import {localStorageService} from "../../js/service/data/localStorageService";
    import {imageUtil} from "../../js/util/imageUtil";
    import {audioUtil} from "../../js/util/audioUtil.js";
    import UnlockModal from "../modals/unlockModal.vue";
    import {MainVue} from "../../js/vue/mainVue.js";
    import {stateService} from "../../js/service/stateService.js";
    import { systemActionService } from '../../js/service/systemActionService';
    import AppGridDisplay from '../grid-display/appGridDisplay.vue';
    import { gridUtil } from '../../js/util/gridUtil';
    import { collectElementService } from '../../js/service/collectElementService';
    import { predictionService } from '../../js/service/predictionService';
    import { liveElementService } from '../../js/service/liveElementService';
    import { GridElement } from '../../js/model/GridElement';

    let vueApp = null;
    let UNLOCK_COUNT = 8;
    let FLOATING_CONTROLS_TIMEOUT = 3000;
    let FLOATING_CONTROLS_DEBOUNCE_KEY = 'FLOATING_CONTROLS_DEBOUNCE_KEY';
    let modalTypes = {
        MODAL_SCANNING: 'MODAL_SCANNING',
        MODAL_MOUSE: 'MODAL_MOUSE',
        MODAL_DIRECTION: 'MODAL_DIRECTION',
        MODAL_HUFFMAN: 'MODAL_HUFFMAN',
        MODAL_SEQUENTIAL: 'MODAL_SEQUENTIAL',
        MODAL_UNLOCK: 'MODAL_UNLOCK'
    };

    let vueConfig = {
        props: {
            gridId: String,
            skipThumbnailCheck: Boolean
        },
        data() {
            return {
                globalGridData: null,
                renderGridData: null,
                showGrid: false,
                metadata: null,
                updatedMetadataDoc: null,
                scanner: null,
                hover: null,
                clicker: null,
                directionInput: null,
                seqInput: null,
                huffmanInput: null,
                inputMethodsInitialized: false,
                showModal: null,
                modalTypes: modalTypes,
                unlockCount: UNLOCK_COUNT,
                unlockCounter: UNLOCK_COUNT,
                floatingControlsVisible: false,
                MainVue: MainVue,
                highlightTimeoutHandler: null,
                highlightedElementId: null,
                systemActionService: systemActionService,
                gridUtil: gridUtil,
                debugExpanded: true,
                debugTab: 'general',
                debugScreen: {
                    screenWidth: 0, screenHeight: 0, availWidth: 0, availHeight: 0,
                    viewportWidth: 0, viewportHeight: 0, devicePixelRatio: 1,
                    orientation: '—', online: true, fullscreen: false, path: ''
                },
                debugGridArea: { width: 0, height: 0 },
                debugGridStats: { elements: 0, fillers: 0, images: 0 },
                debugImageStats: { loaded: 0, pending: 0, failed: 0, dimensions: [] },
                debugLastLoad: null
            }
        },
        components: {
            AppGridDisplay,
            UnlockModal,
            SequentialInputModal,
            HuffmanInputModal,
            DirectionInputModal,
            MouseModal,
            ScanningModal, HeaderIcon
        },
        methods: {
            refreshDebugMetrics() {
                if (typeof window === 'undefined') {
                    return;
                }
                this.debugScreen = {
                    screenWidth: window.screen ? window.screen.width : 0,
                    screenHeight: window.screen ? window.screen.height : 0,
                    availWidth: window.screen ? window.screen.availWidth : 0,
                    availHeight: window.screen ? window.screen.availHeight : 0,
                    viewportWidth: window.innerWidth,
                    viewportHeight: window.innerHeight,
                    devicePixelRatio: window.devicePixelRatio || 1,
                    orientation: window.innerWidth >= window.innerHeight ? 'Horizontal' : 'Vertical',
                    online: navigator.onLine,
                    fullscreen: !!(document.fullscreenElement || document.webkitFullscreenElement),
                    path: window.location ? window.location.hash || window.location.pathname : ''
                };

                const container = document.querySelector('#grid-container');
                if (container) {
                    const rect = container.getBoundingClientRect();
                    this.debugGridArea = {
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                    };
                    const images = Array.from(container.querySelectorAll('img'));
                    const loaded = images.filter(img => img.complete && img.naturalWidth > 0);
                    this.debugImageStats = {
                        loaded: loaded.length,
                        pending: images.filter(img => !img.complete).length,
                        failed: images.filter(img => img.complete && img.naturalWidth === 0).length,
                        dimensions: loaded.slice(0, 6).map(img => img.naturalWidth + '×' + img.naturalHeight)
                    };
                } else {
                    this.debugGridArea = { width: 0, height: 0 };
                    this.debugImageStats = { loaded: 0, pending: 0, failed: 0, dimensions: [] };
                }

                const elements = this.renderGridData && Array.isArray(this.renderGridData.gridElements)
                    ? this.renderGridData.gridElements : [];
                this.debugGridStats = {
                    elements: elements.length,
                    fillers: elements.filter(element => element.type === GridElement.ELEMENT_TYPE_UI_FILLER).length,
                    images: elements.filter(element => element.image && (element.image.url || element.image.data)).length
                };
            },
            formatDebugMs(value) {
                return value == null || !Number.isFinite(value) ? '—' : (Math.round(value * 10) / 10) + ' ms';
            },
            async copyDebugReport() {
                this.refreshDebugMetrics();
                const report = {
                    capturedAt: new Date().toISOString(),
                    screen: this.debugScreen,
                    gridArea: this.debugGridArea,
                    grid: this.renderGridData ? {
                        id: this.renderGridData.id,
                        rows: this.renderGridData.rowCount,
                        columns: this.renderGridData.minColumnCount,
                        elements: this.debugGridStats,
                        imagesInDOM: this.debugImageStats
                    } : null,
                    lastLoad: this.debugLastLoad
                };
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
                    } else {
                        const textArea = document.createElement('textarea');
                        textArea.value = JSON.stringify(report, null, 2);
                        textArea.style.position = 'fixed';
                        textArea.style.opacity = '0';
                        document.body.appendChild(textArea);
                        textArea.select();
                        document.execCommand('copy');
                        document.body.removeChild(textArea);
                    }
                } catch (error) {
                    log.warn('No se pudo copiar el informe de diagnóstico', error);
                }
            },
            showFloatingControls() {
                this.floatingControlsVisible = true;
                util.debounce(() => {
                    this.floatingControlsVisible = false;
                }, FLOATING_CONTROLS_TIMEOUT, FLOATING_CONTROLS_DEBOUNCE_KEY);
            },
            openModal(modalType) {
                this.showModal = modalType;
                stopInputMethods();
            },
            lock() {
                this.floatingControlsVisible = false;
                util.clearDebounce(FLOATING_CONTROLS_DEBOUNCE_KEY);
                let thiz = this;
                thiz.metadata.locked = true;
                thiz.unlockCounter = UNLOCK_COUNT;
                dataService.saveMetadata(thiz.metadata).then(() => {
                    this.setViewPropsLocked();
                });
            },
            unlock(force) {
                let thiz = this;
                if (!force && localStorageService.getAppSettings().unlockPasscode) {
                    thiz.showModal = modalTypes.MODAL_UNLOCK;
                    return;
                }
                thiz.unlockCounter--;
                util.debounce(function () {
                    thiz.unlockCounter = UNLOCK_COUNT;
                }, 3000);
                if (thiz.unlockCounter === 0 || force) {
                    thiz.metadata.locked = false;
                    dataService.saveMetadata(thiz.metadata).then(() => {
                        $(document).trigger(constants.EVENT_SIDEBAR_OPEN);
                        this.setViewPropsUnlocked();
                    });
                }
            },
            setViewPropsLocked() {
                $(document).trigger(constants.EVENT_SIDEBAR_CLOSE);
                $(document).trigger(constants.EVENT_UI_LOCKED);

                // prevent zoom
                $('#viewPortMeta').attr('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
                $('#gridView').on('touchmove', this.preventZoomHandler);
            },
            setViewPropsUnlocked() {
                $(document).trigger(constants.EVENT_UI_UNLOCKED);

                //enable zoom
                $('#viewPortMeta').attr('content', 'width=device-width, initial-scale=1');
                $('body').attr('touch-action', '');
                $('#gridView').off('touchmove', this.preventZoomHandler);
            },
            preventZoomHandler(event) {
                event.preventDefault();
            },
            reloadInputMethods() {
                this.initInputMethods({reload: true});
            },
            async initInputMethods(options = {}) {
                options.continueInputMethods = options.continueInputMethods || false;
                options.reload = options.reload || false;
                if (this.inputMethodsInitialized) {
                    stopInputMethods();
                }
                if (options.reload) {
                    let metadata = await dataService.getMetadata();
                    this.metadata = JSON.parse(JSON.stringify(metadata));
                    initContextmenu(); //in order to update visualization of active input methods in context menu
                }
                let thiz = this;
                let inputConfig = thiz.metadata.inputConfig;
                let selectionListener = (item) => {
                    this.stopHighlightElements();
                    L.removeAddClass(item, 'selected');
                    actionService.doAction(thiz.renderGridData, item.id);
                };
                let activeListener = (items, wrap, restarted) => {
                    if (!Array.isArray(items)) {
                        items = [items];
                    }
                    if (inputConfig.globalReadActive && items && items.length === 1 && items[0]) {
                        let text = items[0].ariaLabel || '';
                        let separatorIndex = text.indexOf(", ");
                        if (!inputConfig.globalReadAdditionalActions && separatorIndex !== -1 && separatorIndex !== 0) {
                            text = text.substring(0, separatorIndex);
                        }
                        speechService.speak(text, {
                            rate: inputConfig.globalReadActiveRate || 1
                        });
                    }

                    if (inputConfig.globalBeepFeedback) {
                        if (restarted) {
                            audioUtil.beepHighDouble();
                        } else if (wrap) {
                            audioUtil.beepHigh();
                        } else {
                            audioUtil.beep();
                        }
                    }
                };

                if (inputConfig.seqEnabled) {
                    thiz.seqInput = SequentialInput.getInstanceFromConfig(inputConfig, {
                        itemSelector: '.element-container:not([data-empty="true"])',
                        selectionListener: selectionListener,
                        activeListener: activeListener
                    });
                    thiz.seqInput.start(options.continueInputMethods);
                }

                if (inputConfig.dirEnabled) {
                    thiz.directionInput = DirectionInput.getInstanceFromConfig(inputConfig, '.element-container:not([data-empty="true"])', 'scanFocus', selectionListener);
                    thiz.directionInput.start();
                }

                if (inputConfig.huffEnabled) {
                    this.huffmanInput = HuffmanInput.getInstanceFromConfig(inputConfig, '.element-container', 'scanFocus', 'scanInactive', selectionListener);
                    this.huffmanInput.start();
                }

                if (inputConfig.scanEnabled) {
                    thiz.scanner = Scanner.getInstanceFromConfig(inputConfig, '.element-container:not([data-empty="true"])', 'scanFocus', 'scanInactive');
                    thiz.scanner.setSelectionListener(selectionListener);
                    thiz.scanner.setActiveListener(activeListener);
                    thiz.scanner.startScanning(options.continueInputMethods);
                }

                if (inputConfig.hoverEnabled) {
                    thiz.hover = Hover.getInstanceFromConfig(inputConfig, '.element-container', {
                        activeListener: activeListener,
                        containerClass: '.grid-container li'
                    });
                    thiz.hover.setSelectionListener(selectionListener);
                    thiz.hover.startHovering();
                } else {
                    $('#touchElement').hide();
                }

                if (inputConfig.mouseclickEnabled || inputConfig.mouseDoubleClickEnabled) {
                    thiz.clicker = Clicker.getInstanceFromConfig(inputConfig, '.element-container');
                    thiz.clicker.setSelectionListener(selectionListener);
                    thiz.clicker.startClickcontrol();
                }
                this.inputMethodsInitialized = true;
            },
            async onNavigateEvent(event, gridData, params) {
                await this.loadGrid(gridData, { continueInputMethods: true });
            },
            async loadGrid(gridData, options = {}) {
                const debugLoadStartedAt = performance.now();
                let debugPreparationMs = null;
                options.continueInputMethods = options.continueInputMethods || false;
                options.forceReload = options.forceReload || false;
                this.debugLastLoad = {
                    gridId: gridData && gridData.id,
                    startedAt: new Date().toLocaleTimeString(),
                    preparationMs: null,
                    renderReadyMs: null,
                    initializationMs: null,
                    totalMs: null
                };
                collectElementService.clearCollectElements();
                if (gridData && (options.forceReload || !this.renderGridData || this.renderGridData.id !== gridData.id)) {
                    if (gridUtil.hasAREModel(gridData)) {
                        let areModel = gridUtil.getAREModel(gridData);
                        areService.uploadAndStartModel(areModel.dataBase64, gridUtil.getAREURL(gridData), areModel.fileName);
                    }

                    // this line before recalculateRenderGrid since it changes gridData!
                    let updateThumbnail = gridUtil.hasOutdatedThumbnail(gridData) && !this.skipThumbnailCheck;

                    await this.recalculateRenderGrid(gridData);
                    debugPreparationMs = performance.now() - debugLoadStartedAt;
                    this.debugLastLoad.preparationMs = debugPreparationMs;
                    Router.addToGridHistory(this.renderGridData.id);

                    if (updateThumbnail) {
                        imageUtil.allImagesLoaded().then(async () => {
                            let screenshot = await imageUtil.getScreenshot("#grid-container");
                            let thumbnail = {
                                data: screenshot,
                                shouldUpdate: false
                            };
                            dataService.saveThumbnail(this.renderGridData.id, thumbnail);
                        })
                    }

                    if (this.metadata.lastOpenedGridId !== gridData.id) {
                        this.metadata.lastOpenedGridId = gridData.id;
                        await dataService.saveMetadata(this.metadata);
                    }
                }

                await this.$nextTick();
                const debugAfterRenderAt = performance.now();
                this.debugLastLoad.renderReadyMs = debugAfterRenderAt - debugLoadStartedAt;
                initContextmenu();
                this.initInputMethods(options);
                this.highlightElements();
                await predictionService.initWithElements(this.renderGridData.gridElements);
                collectElementService.initWithGrid(this.renderGridData);
                liveElementService.initWithElements(this.renderGridData.gridElements);
                $(document).trigger(constants.EVENT_GRID_LOADED);
                this.debugLastLoad.initializationMs = performance.now() - debugAfterRenderAt;
                this.debugLastLoad.totalMs = performance.now() - debugLoadStartedAt;
                this.refreshDebugMetrics();
            },
            highlightElements() {
                clearTimeout(this.highlightTimeoutHandler);
                let params = urlParamService.getSearchQueryParams();
                if (params.highlightIds) {
                    $(`#${params.highlightIds[0]}`).addClass('highlight');
                    this.highlightTimeoutHandler = setTimeout(() => {
                        this.stopHighlightElements();
                    }, 15000);
                    this.highlightedElementId = params.highlightIds[0];
                    params.highlightIds.shift();
                    params.highlightIds = params.highlightIds.length > 0 ? params.highlightIds : null;
                    urlParamService.setParamsToSearchQuery(params);
                }
            },
            stopHighlightElements() {
                if (this.highlightedElementId) {
                    $(`#${this.highlightedElementId}`).removeClass('highlight');
                    this.highlightedElementId = null;
                }
            },
            toEditGrid() {
                Router.toEditGrid(this.renderGridData.id);
            },
            toLogin() {
                Router.toLogin();
            },
            async onExternalUpdate(event, updatedIds, updatedDocs, deletedIds) {
                let thiz = this;
                if (!vueApp) {
                    setTimeout(() => {
                        thiz.onExternalUpdate(event, updatedIds, updatedDocs);
                    }, 500);
                    return;
                }
                if (deletedIds.includes(vueApp.gridId)) {
                    Router.toManageGrids();
                    return;
                }
                log.debug('got update event, ids updated:' + updatedIds);
                let updatedGridDoc = updatedDocs.filter(doc => (vueApp.renderGridData && doc.id === vueApp.renderGridData.id))[0];
                let hasUpdatedGlobalGrid = updatedDocs.filter(doc => (this.metadata && doc.id === this.metadata.globalGridId)).length > 0;
                this.updatedMetadataDoc = updatedDocs.filter(doc => (vueApp.metadata && doc.id === vueApp.metadata.id))[0] || this.updatedMetadataDoc;
                if (updatedGridDoc) {
                    let gridDoc = await dataService.getGrid(updatedGridDoc.id); // get again in order to be sure to have correct revision on conflicts
                    vueApp.loadGrid(gridDoc, { continueInputMethods: true, forceReload: true });
                } else if (hasUpdatedGlobalGrid) {
                    let gridData = await dataService.getGrid(vueApp.renderGridData.id, false, true);
                    this.globalGridData = await dataService.getGlobalGrid();
                    vueApp.loadGrid(gridData, { continueInputMethods: true, forceReload: true });
                }
                if (localStorageService.getAppSettings().syncNavigation) {
                    if (this.updatedMetadataDoc && this.updatedMetadataDoc.lastOpenedGridId !== vueApp.renderGridData.id) {
                        dataService.getGrid(this.updatedMetadataDoc.lastOpenedGridId).then(toGrid => {
                            if (!gridUtil.hasOutdatedThumbnail(toGrid)) {
                                Router.toLastOpenedGrid();
                            }
                        });
                        return;
                    }
                    if (this.updatedMetadataDoc && this.updatedMetadataDoc.fullscreen !== vueApp.metadata.fullscreen) {
                        if (this.updatedMetadataDoc.fullscreen) {
                            systemActionService.enterFullscreen(true);
                        } else {
                            $(document).trigger(constants.EVENT_SIDEBAR_OPEN);
                        }
                    }
                    if (this.updatedMetadataDoc && this.updatedMetadataDoc.locked !== vueApp.metadata.locked) {
                        if (this.updatedMetadataDoc.locked) {
                            vueApp.lock();
                        } else {
                            vueApp.unlock(true);
                        }
                    }
                }
                this.metadata = this.updatedMetadataDoc || this.metadata;
            },
            async recalculateRenderGrid(gridData) {
                // attention: gridData also changes because of "noDeepCopy: true"
                // just using this.renderGridData for clarity
                this.showGrid = false;
                let globalGrid = null;
                gridData = gridUtil.fillFreeSpaces(gridData, GridElement.ELEMENT_TYPE_UI_FILLER);
                if (gridUtil.hasDynamicGridPlaceholder(this.globalGridData)) {
                    this.globalGridData = gridUtil.fillFreeSpaces(this.globalGridData, GridElement.ELEMENT_TYPE_UI_FILLER);
                }
                if (gridData.showGlobalGrid) {
                    globalGrid = this.globalGridData;
                    if (gridData.globalGridId) { // custom global grid
                        globalGrid = await dataService.getGrid(gridData.globalGridId, false, true);
                    }
                    this.renderGridData = gridUtil.mergeGrids(gridData, globalGrid, {
                        globalGridHeightPercentage: this.metadata.globalGridHeightPercentage,
                        noDeepCopy: true
                    });
                } else {
                    this.renderGridData = gridData;
                }
                this.renderGridData = gridUtil.adaptFirstRowHeight(this.renderGridData, this.metadata.firstRowHeightFactor);
                this.renderGridData.minColumnCount = gridUtil.getWidthWithBounds(this.renderGridData);
                this.renderGridData.rowCount = gridUtil.getHeightWithBounds(this.renderGridData);
                this.renderGridData.gridElements = this.renderGridData.gridElements.filter(e => !e.hidden);

                // Check for local toggle level first, otherwise use synchronized metadata level
                let isToggled = localStorageService.get(localStorageService.KEY_CURRENT_TOGGLE_LEVEL);
                let effectiveLevel = isToggled ? localStorageService.getJSON(localStorageService.KEY_CURRENT_TOGGLE_LEVEL) : this.metadata.vocabularyLevel;

                if (effectiveLevel) {
                    let globalGridElements = globalGrid ? globalGrid.gridElements : [];
                    let globalGridElemIds = globalGridElements.map(e => e.id);
                    let normalGridElements = this.renderGridData.gridElements.filter(e => !globalGridElemIds.includes(e.id));
                    let noneHasVocabLevelGlobal = globalGridElements.every(e => !e.vocabularyLevel);
                    let noneHasVocabLevelNormal = normalGridElements.every(e => !e.vocabularyLevel);
                    this.renderGridData.gridElements = this.renderGridData.gridElements.filter(e => {
                        let elemFitsVocabLevel = e.vocabularyLevel && e.vocabularyLevel <= effectiveLevel;
                        if (globalGridElemIds.includes(e.id)) {
                            // is elem in global grid
                            return noneHasVocabLevelGlobal || elemFitsVocabLevel || e.type !== GridElement.ELEMENT_TYPE_NORMAL;
                        } else {
                            // is elem in normal grid
                            return noneHasVocabLevelNormal || elemFitsVocabLevel || e.type !== GridElement.ELEMENT_TYPE_NORMAL;
                        }
                    });
                }
                this.showGrid = true;
                stateService.setCurrentGrid(this.renderGridData);
            },
            onSidebarOpen() {
                if (!vueApp || !vueApp.metadata) {
                    return;
                }
                vueApp.metadata.fullscreen = false;
                $(document).trigger(constants.EVENT_GRID_RESIZE);
            },
            resizeListener() {
                this.refreshDebugMetrics();
                let thiz = this;
                util.debounce(function () {
                    if (thiz.huffmanInput) {
                        thiz.huffmanInput.reinit();
                    }
                }, 500);
            },
            contextMenuListener(event) {
                event.preventDefault();
            },
            async metadataUpdated() {
                this.metadata = await dataService.getMetadata();
            },
            async rerenderGrid() {
                if (this.renderGridData) {
                    // Reload the grid with fresh data without updating metadata
                    let freshGridData = await dataService.getGrid(this.renderGridData.id);
                    await this.loadGrid(freshGridData, { forceReload: true });
                }
            }
        },
        created() {
            $(document).on(constants.EVENT_DB_PULL_UPDATED, this.onExternalUpdate);
            $(document).on(constants.EVENT_SIDEBAR_OPEN, this.onSidebarOpen);
            $(document).on(constants.EVENT_NAVIGATE_GRID_IN_VIEWMODE, this.onNavigateEvent);
            document.addEventListener('contextmenu', this.contextMenuListener);
            window.addEventListener('resize', this.resizeListener, true);
            $(document).on(constants.EVENT_GRID_RESIZE, this.resizeListener);
            $(document).on(constants.EVENT_METADATA_UPDATED, this.metadataUpdated);
            $(document).on(constants.EVENT_GRID_RERENDER, this.rerenderGrid);
        },
        beforeDestroy() {
            util.clearDebounce(FLOATING_CONTROLS_DEBOUNCE_KEY);
            $(document).off(constants.EVENT_DB_PULL_UPDATED, this.onExternalUpdate);
            $(document).off(constants.EVENT_SIDEBAR_OPEN, this.onSidebarOpen);
            $(document).off(constants.EVENT_NAVIGATE_GRID_IN_VIEWMODE, this.onNavigateEvent);
            document.removeEventListener('contextmenu', this.contextMenuListener);
            window.removeEventListener('resize', this.resizeListener, true);
            $(document).off(constants.EVENT_GRID_RESIZE, this.resizeListener);
            $(document).off(constants.EVENT_METADATA_UPDATED, this.metadataUpdated);
            $(document).off(constants.EVENT_GRID_RERENDER, this.rerenderGrid);
            stopInputMethods();
            this.setViewPropsUnlocked();
            $.contextMenu('destroy');
            liveElementService.stop();
            vueApp = null;
        },
        mounted: async function () {
            vueApp = this;
            this.refreshDebugMetrics();

            let savedMetadata = await dataService.getMetadata();
            let metadata = JSON.parse(JSON.stringify(savedMetadata || new MetaData()));
            metadata.lastOpenedGridId = this.gridId;
            metadata.locked = metadata.locked === undefined ? urlParamService.isDemoMode() && dataService.getCurrentUser() === constants.LOCAL_DEMO_USERNAME : metadata.locked;
            if (metadata.locked) {
                $(document).trigger(constants.EVENT_UI_LOCKED);
            }
            metadata.fullscreen = metadata.fullscreen === undefined ? urlParamService.isDemoMode() && dataService.getCurrentUser() === constants.LOCAL_DEMO_USERNAME : metadata.fullscreen;
            metadata.fullscreen = urlParamService.isFullscreen(true) ? true : metadata.fullscreen;
            metadata.fullscreen = metadata.fullscreen && util.isFullscreen();
            metadata.locked = urlParamService.isLocked(true) ? true : metadata.locked;
            metadata.inputConfig.scanEnabled = urlParamService.isScanningEnabled() ? true : metadata.inputConfig.scanEnabled;
            metadata.inputConfig.dirEnabled = urlParamService.isDirectionEnabled() ? true : metadata.inputConfig.dirEnabled;
            metadata.inputConfig.huffEnabled = urlParamService.isHuffmanEnabled() ? true : metadata.inputConfig.huffEnabled;
            dataService.saveMetadata(metadata).then(() => {
                if (metadata.locked) {
                    this.setViewPropsLocked();
                }
            });
            this.metadata = metadata;
            this.globalGridData = await dataService.getGlobalGrid();
            let gridData = await dataService.getGrid(this.gridId, false, true);
            if (!gridData) {
                log.warn('grid not found! gridId: ' + this.gridId);
                let grids = await dataService.getGrids(false, true);
                if (grids && grids[0]) {
                    gridData = await dataService.getGrid(grids[0].id);
                } else {
                    return Router.toManageGrids();
                }
            }
            this.loadGrid(gridData);
        }
    };

    function stopInputMethods() {
        if (!vueApp) {
            return;
        }
        if (vueApp.scanner) vueApp.scanner.destroy();
        if (vueApp.hover) vueApp.hover.destroy();
        if (vueApp.clicker) vueApp.clicker.destroy();
        if (vueApp.directionInput) vueApp.directionInput.destroy();
        if (vueApp.huffmanInput) vueApp.huffmanInput.destroy();
        if (vueApp.seqInput) vueApp.seqInput.destroy();
        vueApp.inputMethodsInitialized = false;
    }

    function initContextmenu() {
        $.contextMenu('destroy');
        let CONTEXT_MOUSE = "CONTEXT_MOUSE";
        let CONTEXT_SCANNING = "CONTEXT_SCANNING";
        let CONTEXT_DIRECTION = "CONTEXT_DIRECTION";
        let CONTEXT_HUFFMAN = "CONTEXT_HUFFMAN";
        let CONTEXT_SEQUENTIAL = "CONTEXT_SEQUENTIAL";

        function getName(i18nKey, isActive) {
            let translated = i18nService.t(i18nKey);
            let activeText = isActive ? ' ' + i18nService.t('activeBracket') : '';
            return `${translated}${activeText}`;
        }

        let inputConfig = vueApp.metadata.inputConfig;
        let mouseTouchEnabled = inputConfig.mouseclickEnabled || inputConfig.hoverEnabled;
        let contextItems = {
            CONTEXT_MOUSE: {
                name: getName('mousetouchInput', mouseTouchEnabled),
                icon: "fas fa-mouse-pointer",
                className: mouseTouchEnabled ? 'boldFont' : ''
            },
            CONTEXT_SCANNING: {
                name: getName('scanning', inputConfig.scanEnabled),
                icon: "fas fa-sort-amount-down",
                className: inputConfig.scanEnabled ? 'boldFont' : ''
            },
            CONTEXT_DIRECTION: {
                name: getName('directionInput', inputConfig.dirEnabled),
                icon: "fas fa-arrows-alt",
                className: inputConfig.dirEnabled ? 'boldFont' : ''
            },
            CONTEXT_HUFFMAN: {
                name: getName('huffmanInput', inputConfig.huffEnabled),
                icon: "fas fa-ellipsis-h",
                className: inputConfig.huffEnabled ? 'boldFont' : ''
            },
            CONTEXT_SEQUENTIAL: {
                name: getName('sequentialInput', inputConfig.seqEnabled),
                icon: "fas fa-arrow-right",
                className: inputConfig.seqEnabled ? 'boldFont' : ''
            }
        };

        $.contextMenu({
            selector: '#inputConfigButton',
            appendTo: '#inputConfigMenu',
            callback: function (key, options) {
                handleContextMenu(key);
            },
            trigger: 'left',
            items: contextItems,
            zIndex: 10
        });

        function handleContextMenu(key, elementId) {
            switch (key) {
                case CONTEXT_MOUSE: {
                    vueApp.openModal(modalTypes.MODAL_MOUSE);
                    break;
                }
                case CONTEXT_SCANNING: {
                    vueApp.openModal(modalTypes.MODAL_SCANNING);
                    break;
                }
                case CONTEXT_DIRECTION: {
                    vueApp.openModal(modalTypes.MODAL_DIRECTION);
                    break;
                }
                case CONTEXT_HUFFMAN: {
                    vueApp.openModal(modalTypes.MODAL_HUFFMAN);
                    break;
                }
                case CONTEXT_SEQUENTIAL: {
                    vueApp.openModal(modalTypes.MODAL_SEQUENTIAL);
                    break;
                }
            }
        }
    }

    export default vueConfig;
</script>

<style scoped>
    .floating-controls {
        position: fixed;
        top: 0.2em;
        left: 50%;
        transform: translateX(-50%);
        z-index: 1000;
        display: inline-flex;
        gap: 0.15em;
    }

    .floating-controls-trigger {
    width: 8em;
    min-height: 1.5em;
    padding: 0.45em 0.35em;
    border: 0;
    background: transparent;
    box-shadow: none;
    transition: none;
    border-radius: 2px;
    -webkit-tap-highlight-color: transparent;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.floating-controls-trigger:hover,
.floating-controls-trigger:focus {
    border: 0;
    background: transparent;
    box-shadow: none;
}

.floating-controls-trigger:focus {
    outline: none;
}

.floating-controls-trigger:focus-visible {
    outline: 2px solid lightblue;
    outline-offset: 2px;
}

.floating-controls-trigger:active {
    background: transparent;
}



    .floating-controls-indicator {
    display: block;
    width: 4em;
    height: 0.4em;
    border-radius: 0.2em;
    background: linear-gradient(
        to bottom,
        rgba(80, 80, 80, 1) 50%,
        rgba(240, 240, 240, 1) 50%
    );
}

    @media (hover: hover) and (pointer: fine) {
        .floating-controls-trigger:hover:not(:active) .floating-controls-indicator {
            background: linear-gradient(
                to bottom,
                rgba(115, 115, 115, 1) 50%,
                rgba(200, 200, 200, 1) 50%
            );
        }
    }

    .floating-control-button {
        height: 1.6em;
        min-width: 2.7em;
        padding: 0 0.65em;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.25em;
        line-height: 1;
    }

    .floating-control-button i {
        font-size: 1.1em;
    }

    .debug-panel {
        position: fixed;
        right: 0.5em;
        bottom: 0.5em;
        z-index: 2000;
        width: min(28rem, calc(100vw - 1em));
        max-height: 58vh;
        overflow: auto;
        color: #f5f7fa;
        background: rgba(22, 27, 34, 0.97);
        border: 1px solid #59636e;
        border-radius: 0.55em;
        box-shadow: 0 3px 18px rgba(0, 0, 0, 0.35);
        font: 12px/1.4 system-ui, sans-serif;
        text-align: left;
    }

    .debug-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.75em;
        padding: 0.6em 0.75em;
        background: #303943;
        border-radius: 0.5em 0.5em 0 0;
    }

    .debug-panel button {
        min-height: 2em;
        padding: 0.25em 0.65em;
        color: inherit;
        background: #3a4652;
        border: 1px solid #64717d;
        border-radius: 0.3em;
        font: inherit;
        cursor: pointer;
    }

    .debug-panel .debug-panel-collapse {
        min-width: 2em;
        font-size: 1.25em;
        line-height: 1;
    }

    .debug-panel-tabs {
        display: flex;
        gap: 0.35em;
        padding: 0.5em 0.65em 0;
    }

    .debug-panel .debug-panel-tabs button.active {
        background: #dbeafe;
        border-color: #dbeafe;
        color: #172033;
        font-weight: 700;
    }

    .debug-panel-content {
        padding: 0.5em 0.75em 0.75em;
    }

    .debug-section-title {
        margin: 0.5em 0 0.3em;
        padding-bottom: 0.2em;
        color: #9ecbff;
        border-bottom: 1px solid #46515c;
        font-weight: 700;
    }

    .debug-metric {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1em;
        padding: 0.18em 0;
    }

    .debug-metric span {
        color: #c3ccd5;
        flex: 1 1 48%;
    }

    .debug-metric strong {
        flex: 1 1 52%;
        text-align: right;
        overflow-wrap: anywhere;
        font-weight: 600;
    }

    .debug-panel .debug-wrap {
        overflow-wrap: anywhere;
    }

    .debug-panel-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4em;
        margin-top: 0.7em;
    }

    .debug-note {
        margin: 0.7em 0 0;
        color: #aeb9c4;
        font-size: 0.9em;
    }

    @media (max-width: 600px) {
        .debug-panel {
            max-height: 48vh;
            font-size: 11px;
        }
    }

</style>