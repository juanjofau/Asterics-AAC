<template>
    <div class="box" id="gridView" v-cloak>
        <header class="srow header" role="toolbar" v-if="metadata" v-show="!metadata.fullscreen && !metadata.locked">
            <header-icon class="left" v-show="!metadata.locked"></header-icon>
            <div class="btn-group left" v-show="!metadata.locked">
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
            <button tabindex="32" v-show="!metadata.locked" @click="systemActionService.enterFullscreen()" class="spaced small" :aria-label="$t('fullscreen')"><i class="fas fa-expand"/> <span class="hide-mobile">{{ $t('fullscreen') }}</span></button>

        </header>
        <div v-if="metadata && (metadata.locked || metadata.fullscreen)" class="floating-controls">
            <button v-if="metadata.locked && !metadata.fullscreen" tabindex="30" @click="unlock()" class="floating-control-button" :aria-label="$t('unlock')" :title="$t('unlock')">
                <i class="fas fa-unlock"></i>
                <span v-if="unlockCounter !== unlockCount">{{unlockCounter}}</span>
            </button>
            <button tabindex="31" @click="toggleFullscreen()" class="floating-control-button" :aria-label="$t('fullscreen')" :title="$t('fullscreen')">
                <i :class="metadata.fullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
            </button>
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
