<template>
    <div class="container-fluid px-0">
        <div class="row">
            <label for="selectMode" class="col-md-5">{{ $t('collectMode') }}</label>
            <div class="col-md-4">
                <select v-if="gridElement" class="col-12" id="selectMode" type="checkbox" v-model="gridElement.mode">
                    <option v-for="mode in GridElementCollect.MODES" :value="mode">{{ $t(mode) }}</option>
                </select>
            </div>
        </div>
        <div class="row">
            <label for="imageHeight" class="col-md-5">{{ $t('heightOfCollectedImages') }}</label>
            <div class="col-md-4">
                <input v-if="gridElement" class="col-12"  id="imageHeight" type="number" min="50" max="100" :disabled="!gridElement.showLabels || !autoOrSeparatedMode" v-model.number="gridElement.imageHeightPercentage"/>
            </div>
        </div>
        <div class="row">
            <label for="singleTextElemFactor" class="col-md-5">{{ $t('factorForFontSizeOfOnlytextElements') }}</label>
            <div class="col-md-4">
                <input v-if="gridElement" class="col-12" id="singleTextElemFactor" type="number" min="0" max="5" step="0.1" :disabled="!autoOrSeparatedMode" v-model.number="gridElement.textElemSizeFactor"/>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <input v-if="gridElement" id="showLabel" type="checkbox" v-model="gridElement.showLabels" :disabled="!autoOrSeparatedMode"/>
                <label for="showLabel">{{ $t('showLabelsOfCollectedImages') }}</label>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <input v-if="gridElement" id="showLongLabels" type="checkbox" v-model="gridElement.showFullLabels"/>
                <label for="showLongLabels">{{ $t('fullyShowLongLabels') }}</label>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <input v-if="gridElement" id="useSingleLine" type="checkbox" v-model="gridElement.singleLine" :disabled="!autoOrSeparatedMode"/>
                <label for="useSingleLine">{{ $t('useHorizontalScrollbarIfElementsDontFit') }}</label>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <input v-if="gridElement" id="displayUpsideDown" type="checkbox" v-model="gridElement.displayUpsideDown"/>
                <label for="displayUpsideDown">{{ $t('displayTextUpsideDown') }}</label>
            </div>
        </div>
        <div class="row">
            <div class="col-12">
                <input v-if="gridElement" id="convertToLowercase" type="checkbox" v-model="gridElement.convertToLowercase"/>
                <label for="convertToLowercase">{{ $t('convertUppercaseKeyboardLettersToLowercase') }}</label>
            </div>
        </div>
        <div class="srow" v-if="metadata">
            <accordion :acc-label="$t('advancedOptions')">

                <div class="srow mb-4">
                    <label class="four columns" for="collectBackgroundColor">
                        {{ metadata.colorConfig.colorMode === ColorConfig.COLOR_MODE_BORDER
                            ? $t('customBorderColor')
                            : $t('customBackgroundColor') }}
                    </label>

                    <input
                        id="collectBackgroundColor"
                        class="five columns"
                        type="color"
                        v-model="gridElement.backgroundColor"
                        @input="gridElement.colorCategory = undefined"
                    />

                    <button class="two columns"
                            :disabled="!gridElement.backgroundColor"
                            @click="gridElement.backgroundColor = null">
                        {{ $t('clear') }}
                    </button>
                </div>

                <div class="srow mb-4">
                    <label class="four columns" for="collectFontColor">
                        {{ $t('fontColor') }}
                    </label>

                    <input
                        id="collectFontColor"
                        class="five columns"
                        type="color"
                        v-model="gridElement.fontColor"
                    />

                    <button class="two columns"
                            :disabled="!gridElement.fontColor"
                            @click="gridElement.fontColor = null">
                        {{ $t('clear') }}
                    </button>
                </div>

                <div class="srow mb-4">
                    <label class="four columns" for="collectTextBackgroundColor">
                        {{ $t('textBackgroundColor') }}
                    </label>

                    <input
                        id="collectTextBackgroundColor"
                        class="five columns"
                        type="color"
                        :value="gridElement.textBackgroundColor ||
                            metadata.textConfig.textBackgroundColor || '#000000'"
                        @input="$set(gridElement, 'textBackgroundColor', $event.target.value)"
                    />

                    <button class="two columns"
                            :disabled="!gridElement.textBackgroundColor"
                            @click="$set(gridElement, 'textBackgroundColor', null)">
                        {{ $t('clear') }}
                    </button>
                </div>

            </accordion>
        </div>
    </div>
</template>

<script>
    import './../../css/modal.css';
    import {GridElementCollect} from "../../js/model/GridElementCollect.js";
    import Accordion from '../components/accordion.vue';
    import { dataService } from '../../js/service/data/dataService.js';
    import { ColorConfig } from '../../js/model/ColorConfig.js';

    export default {
        components: { Accordion },
        props: ['gridElement'],
        data: function () {
            return {
                GridElementCollect: GridElementCollect,
                metadata: null,
                ColorConfig: ColorConfig
            }
        },
        computed: {
            autoOrSeparatedMode: function () {
                return [GridElementCollect.MODE_AUTO, GridElementCollect.MODE_COLLECT_SEPARATED].includes(this.gridElement.mode);
            }
        },
        methods: {
        },
        mounted() {
            dataService.getMetadata().then(metadata => {
                this.metadata = metadata;
            });
        },
        beforeDestroy() {
        }
    }
</script>

<style scoped>
.row {
    margin-bottom: 1em;
}
</style>