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
        <div class="srow mb-4">
            <label class="four columns" for="collectBackgroundColor">{{ $t('backgroundColor') }}</label>
            <input id="collectBackgroundColor" class="five columns" type="color" v-model="gridElement.backgroundColor" />
        </div>
        <div class="srow mb-4">
            <label class="four columns" for="collectFontColorAuto">{{ $t('fontColorAuto') }}</label>
            <input id="collectFontColorAuto" class="one column" type="checkbox" v-model="gridElement.fontColorAuto" />
        </div>
        <div class="srow mb-4">
            <label class="four columns" for="collectFontColor">{{ $t('fontColor') }}</label>
            <input id="collectFontColor" class="five columns" type="color" v-model="gridElement.fontColor" :disabled="gridElement.fontColorAuto" />
        </div>
        <div class="srow mb-4">
            <label class="four columns" for="collectTextBackgroundEnabled">{{ $t('textBackground') }}</label>
            <input id="collectTextBackgroundEnabled" class="one column" type="checkbox" v-model="gridElement.textBackgroundEnabled" />
        </div>
        <div v-if="gridElement.textBackgroundEnabled" class="srow mb-4">
            <label class="four columns" for="collectTextBackgroundColor">{{ $t('textBackgroundColor') }}</label>
            <input id="collectTextBackgroundColor" class="five columns" type="color" v-model="gridElement.textBackgroundColor" />
        </div>
        <slider-input
            v-if="gridElement.textBackgroundEnabled"
            id="collectTextBackgroundOpacity"
            label="textBackgroundOpacity"
            :value="gridElement.textBackgroundOpacity"
            :min="0"
            :max="100"
            :step="1"
            unit="%"
            @input="$set(gridElement, 'textBackgroundOpacity', Number($event))"
        />
    </div>
</template>

<script>
    import './../../css/modal.css';
    import {GridElementCollect} from "../../js/model/GridElementCollect.js";
    import SliderInput from './input/sliderInput.vue';

    export default {
        components: { SliderInput },
        props: ['gridElement'],
        data: function () {
            return {
                GridElementCollect: GridElementCollect
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
            if (!/^#[0-9a-f]{6}$/i.test(this.gridElement.backgroundColor || '')) {
                this.$set(this.gridElement, 'backgroundColor', '#ffffff');
            }
            if (typeof this.gridElement.fontColorAuto !== 'boolean') {
                this.$set(this.gridElement, 'fontColorAuto', !this.gridElement.fontColor);
            }
            if (!/^#[0-9a-f]{6}$/i.test(this.gridElement.fontColor || '')) {
                this.$set(this.gridElement, 'fontColor', '#000000');
            }
            if (typeof this.gridElement.textBackgroundEnabled !== 'boolean') this.$set(this.gridElement, 'textBackgroundEnabled', false);
            if (!/^#[0-9a-f]{6}$/i.test(this.gridElement.textBackgroundColor || '')) {
                this.$set(this.gridElement, 'textBackgroundColor', '#000000');
            }
            if (this.gridElement.textBackgroundOpacity === undefined || this.gridElement.textBackgroundOpacity === null) {
                this.$set(this.gridElement, 'textBackgroundOpacity', 50);
            }
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