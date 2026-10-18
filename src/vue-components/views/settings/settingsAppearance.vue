<template>
    <div :class="['experimental-appearance', 'interface-skin-' + (metadata.colorConfig.experimentalStyle || 'classic')]">
        <div class="srow">
            <div class="nine columns settings-area">
                <h3 class="mt-2">{{ $t('quickSettings') }}</h3>
                <div class="srow">
                    <button @click="toDefault"><span class="fas fa-undo"/> {{ $t('setToDefaultSettings') }}</button>
                    <button @click="toDefaultBgColored"><span class="fas fa-square"/> {{ $t('setToDefaultSettingsBgColored') }}</button>
                    <button @click="toDefaultBorderColored"><span class="far fa-square"/> {{ $t('setToDefaultSettingsBorderColored') }}</button>
                    <button @click="toDefaultBothColored"><span class="fas fa-square"/><span class="far fa-square"/> {{ $t('setToDefaultSettingsBothColored') }}</button>
                    <button @click="toDarkMode"><span class="fas fa-moon"/> {{ $t('setToDarkMode') }}</button>
                    <button @click="toLightMode"><span class="fas fa-sun"/> {{ $t('setToLightMode') }}</button>
                </div>
                <h3 class="mt-2">{{ $t('experimentalLooks') }}</h3>
                <p>{{ $t('experimentalLooksDescription') }}</p>
                <div class="srow experimental-look-picker">
                    <button type="button" :class="{ 'is-active': metadata.colorConfig.experimentalStyle === 'classic' }" @click="applyExperimentalStyle('classic')">{{ $t('lookClassic') }}</button>
                    <button type="button" :class="{ 'is-active': metadata.colorConfig.experimentalStyle === 'neon' }" @click="applyExperimentalStyle('neon')">{{ $t('lookNeon') }}</button>
                    <button type="button" :class="{ 'is-active': metadata.colorConfig.experimentalStyle === 'candy' }" @click="applyExperimentalStyle('candy')">{{ $t('lookCandy') }}</button>
                    <button type="button" :class="{ 'is-active': metadata.colorConfig.experimentalStyle === 'brutalist' }" @click="applyExperimentalStyle('brutalist')">{{ $t('lookBrutalist') }}</button>
                    <button type="button" :class="{ 'is-active': metadata.colorConfig.experimentalStyle === 'glass' }" @click="applyExperimentalStyle('glass')">{{ $t('lookGlass') }}</button>
                    <button type="button" :class="{ 'is-active': metadata.colorConfig.experimentalStyle === 'aurora' }" @click="applyExperimentalStyle('aurora')">{{ $t('lookAurora') }}</button>
                    <button type="button" :class="{ 'is-active': metadata.colorConfig.experimentalStyle === 'soft3d' }" @click="applyExperimentalStyle('soft3d')">{{ $t('lookSoft3d') }}</button>
                    <button type="button" :class="{ 'is-active': metadata.colorConfig.experimentalStyle === 'outline' }" @click="applyExperimentalStyle('outline')">{{ $t('lookOutline') }}</button>
                </div>
                <h3 class="mt-2">{{ $t('textHeading') }}</h3>
                <div class="srow">
                    <label class="three columns" for="textPos">{{ $t('textPosition') }}</label>
                    <select id="textPos" v-model="metadata.textConfig.textPosition" class="five columns" @change="saveMetadata(metadata)">
                        <option :value="TextConfig.TEXT_POS_ABOVE">{{ $t('top') }}</option>
                        <option :value="TextConfig.TEXT_POS_BELOW">{{ $t('bottom') }}</option>
                    </select>
                </div>
                <div class="srow">
                    <label class="three columns" for="fontFamily">{{ $t('fontFamily') }}</label>
                    <select id="fontFamily" v-model="metadata.textConfig.fontFamily" class="five columns" @change="saveMetadata(metadata)">
                        <option v-for="value in TextConfig.FONTS" :value="value">{{ value }}</option>
                    </select>
                </div>
                <div class="srow">
                    <label class="three columns" for="convertText">{{ $t('convertElementLabels') }}</label>
                    <select id="convertText" v-model="metadata.textConfig.convertMode" class="five columns" @change="saveMetadata(metadata)">
                        <option :value="null">{{ $t('dontConvertLabels') }}</option>
                        <option :value="TextConfig.CONVERT_MODE_UPPERCASE">{{ $t('convertToUppercasse') }}</option>
                        <option :value="TextConfig.CONVERT_MODE_LOWERCASE">{{ $t('convertToLowercase') }}</option>
                    </select>
                </div>
                <div class="srow mb-0">
                    <slider-input label="fontSizeTextAndImage" unit="%" id="fontSizeTextAndImage" min="0" max="100" step="1" v-model.number="metadata.textConfig.fontSizePct" @change="saveMetadata(metadata)"/>
                </div>
                <div class="srow">
                    <slider-input label="onlyTextFontSize" unit="%" id="onlyTextFontSize" min="0" max="100" step="1" v-model.number="metadata.textConfig.onlyTextFontSizePct" @change="saveMetadata(metadata)"/>
                </div>
                <div class="srow mb-5">
                    <accordion :acc-label="$t('advancedOptions')" class="eleven columns">
                        <div class="srow">
                            <label class="three columns" for="fittingMode">{{ $t('modeForHandlingTooLongTexts') }}</label>
                            <select id="fittingMode" v-model="metadata.textConfig.fittingMode" class="five columns" @change="saveMetadata(metadata)">
                                <option :value="TextConfig.TOO_LONG_AUTO">{{ $t('adaptAutomatically') }}</option>
                                <option :value="TextConfig.TOO_LONG_TRUNCATE">{{ $t('truncate') }}</option>
                                <option :value="TextConfig.TOO_LONG_ELLIPSIS">{{ $t('ellipsisDotDotDot') }}</option>
                            </select>
                        </div>
                        <div class="srow">
                            <label class="three columns" for="maxLines">{{ $t('maximumNumberOfLines') }}</label>
                            <select id="maxLines" v-model="metadata.textConfig.maxLines" class="five columns" @change="saveMetadata(metadata)">
                                <option :value="1">1</option>
                                <option :value="2">2</option>
                                <option :value="3">3</option>
                            </select>
                        </div>
                        <div class="srow mt-3">
                            <slider-input label="lineHeight" id="lineHeight" min="1" max="3" step="0.1" v-model.number="metadata.textConfig.lineHeight" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow mb-2">
                            <slider-input label="onlyTextLineHeight" id="onlyTextLineHeight" min="1" max="3" step="0.1" v-model.number="metadata.textConfig.onlyTextLineHeight" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <label class="three columns" for="fontColor">
                                <span>{{ $t('fontColor') }}</span>
                            </label>
                            <input id="fontColor" v-model="metadata.textConfig.fontColor" class="five columns" type="color" @change="saveMetadata(metadata)">
                            <button class="three columns" @click="metadata.textConfig.fontColor = constants.DEFAULT_ELEMENT_FONT_COLOR; saveMetadata(metadata)">{{ $t('reset') }}</button>
                        </div>
                        <div class="srow">
                            <input id="autoSizeKeyboardLetters" type="checkbox" v-model="metadata.textConfig.autoSizeKeyboardLetters" @change="saveMetadata(metadata)"/>
                            <label for="autoSizeKeyboardLetters">{{ $t('autoSizeKeyboardLetters') }}</label>
                        </div>
                    </accordion>
                </div>
                <h3 class="mt-5">{{ $t('gridElement') }}</h3>
                <div class="srow">
                    <label class="three columns" for="elemColor">
                        <span>{{ $t('defaultGridElementColor') }}</span>
                    </label>
                    <input id="elemColor" v-model="metadata.colorConfig.elementBackgroundColor" class="five columns" type="color" @change="saveMetadata(metadata)">
                    <button class="three columns" @click="metadata.colorConfig.elementBackgroundColor = constants.DEFAULT_ELEMENT_BACKGROUND_COLOR; saveMetadata(metadata)">{{ $t('reset') }}</button>
                </div>
                <div class="srow">
                    <label class="three columns" for="colorMode">{{ $t('colorMode') }}</label>
                    <select id="colorMode" v-model="metadata.colorConfig.colorMode" class="five columns" @change="saveMetadata(metadata)">
                        <option :value="ColorConfig.COLOR_MODE_BACKGROUND">{{ $t('colorModeBackground') }}</option>
                        <option :value="ColorConfig.COLOR_MODE_BORDER">{{ $t('colorModeBorder') }}</option>
                        <option :value="ColorConfig.COLOR_MODE_BOTH">{{ $t('colorModeBackgroundBorder') }}</option>
                    </select>
                </div>
                <div class="srow mt-5">
                    <accordion :acc-label="$t('advancedOptions')" class="eleven columns">
                        <div class="srow">
                            <label class="three columns" for="borderColor">
                                <span>{{ $t('defaultGridElementBorderColor') }}</span>
                            </label>
                            <input id="borderColor" v-model="metadata.colorConfig.elementBorderColor" class="five columns" type="color" @change="saveMetadata(metadata)">
                            <button class="three columns" @click="metadata.colorConfig.elementBorderColor = constants.DEFAULT_ELEMENT_BORDER_COLOR; saveMetadata(metadata)">{{ $t('reset') }}</button>
                        </div>
                        <div class="srow">
                            <slider-input label="borderWidth" unit="%" id="borderWidth" min="0" max="2" step="0.05" :decimals="2" e v-model.number="metadata.colorConfig.borderWidth" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <slider-input label="elementMargin" unit="%" id="elementMargin" min="0" max="2" step="0.05" :decimals="2" v-model.number="metadata.colorConfig.elementMargin" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <slider-input label="borderRadius" unit="%" id="borderRadius" min="0" max="4" step="0.05" :decimals="2" v-model.number="metadata.colorConfig.borderRadius" @change="saveMetadata(metadata)"/>
                        </div>
                        <h4 class="mt-4">{{ $t('cellDepthEffects') }}</h4>
                        <p>{{ $t('shadowMeasurementsDescription') }}</p>
                        <div class="srow">
                            <button type="button" @click="applyShadowPreset('flat')">{{ $t('shadowPresetFlat') }}</button>
                            <button type="button" @click="applyShadowPreset('soft')">{{ $t('shadowPresetSoft') }}</button>
                            <button type="button" @click="applyShadowPreset('raised')">{{ $t('shadowPresetRaised') }}</button>
                            <button type="button" @click="applyShadowPreset('pressed')">{{ $t('shadowPresetPressed') }}</button>
                        </div>
                        <div class="srow">
                            <input id="outerShadowEnabled" type="checkbox" v-model="metadata.colorConfig.outerShadowEnabled" @change="saveMetadata(metadata)"/>
                            <label for="outerShadowEnabled">{{ $t('enableOuterShadow') }}</label>
                        </div>
                        <div class="srow">
                            <label class="three columns" for="outerShadowColor">{{ $t('outerShadowColor') }}</label>
                            <input id="outerShadowColor" class="five columns" type="color" v-model="metadata.colorConfig.outerShadowColor" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <slider-input label="outerShadowOpacity" unit="%" id="outerShadowOpacity" min="0" max="100" step="1" :decimals="0" v-model.number="metadata.colorConfig.outerShadowOpacity" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <slider-input label="outerShadowHorizontalOffset" unit="%" id="outerShadowOffsetX" min="-5" max="5" step="0.1" :decimals="1" v-model.number="metadata.colorConfig.outerShadowOffsetX" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <slider-input label="outerShadowVerticalOffset" unit="%" id="outerShadowOffsetY" min="-5" max="5" step="0.1" :decimals="1" v-model.number="metadata.colorConfig.outerShadowOffsetY" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <slider-input label="outerShadowBlur" unit="%" id="outerShadowBlur" min="0" max="8" step="0.1" :decimals="1" v-model.number="metadata.colorConfig.outerShadowBlur" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <slider-input label="outerShadowSpread" unit="%" id="outerShadowSpread" min="-2" max="2" step="0.1" :decimals="1" v-model.number="metadata.colorConfig.outerShadowSpread" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <input id="innerShadowEnabled" type="checkbox" v-model="metadata.colorConfig.innerShadowEnabled" @change="saveMetadata(metadata)"/>
                            <label for="innerShadowEnabled">{{ $t('enableInnerShadow') }}</label>
                        </div>
                        <div class="srow">
                            <label class="three columns" for="innerShadowColor">{{ $t('innerShadowColor') }}</label>
                            <input id="innerShadowColor" class="five columns" type="color" v-model="metadata.colorConfig.innerShadowColor" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <slider-input label="innerShadowOpacity" unit="%" id="innerShadowOpacity" min="0" max="100" step="1" :decimals="0" v-model.number="metadata.colorConfig.innerShadowOpacity" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <slider-input label="innerShadowHorizontalOffset" unit="%" id="innerShadowOffsetX" min="-5" max="5" step="0.1" :decimals="1" v-model.number="metadata.colorConfig.innerShadowOffsetX" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <slider-input label="innerShadowVerticalOffset" unit="%" id="innerShadowOffsetY" min="-5" max="5" step="0.1" :decimals="1" v-model.number="metadata.colorConfig.innerShadowOffsetY" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <slider-input label="innerShadowBlur" unit="%" id="innerShadowBlur" min="0" max="8" step="0.1" :decimals="1" v-model.number="metadata.colorConfig.innerShadowBlur" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <slider-input label="innerShadowSpread" unit="%" id="innerShadowSpread" min="-2" max="2" step="0.1" :decimals="1" v-model.number="metadata.colorConfig.innerShadowSpread" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <label class="three columns" for="colorScheme">
                                <span>{{ $t('colorSchemeForCategories') }}</span>
                            </label>
                            <select id="colorScheme" class="five columns" v-model="metadata.colorConfig.activeColorScheme" @change="saveMetadata(metadata)">
                                <option v-for="scheme in constants.DEFAULT_COLOR_SCHEMES" :value="scheme.name">{{scheme.name | translate}}</option>
                            </select>
                        </div>
                        <div class="srow">
                            <div class="five columns offset-by-three d-flex" style="height: 1.5em">
                                <div class="flex-grow-1" v-for="(color, index) in colorUtil.getActiveColorScheme(metadata).colors" :title="$t(colorUtil.getActiveColorScheme(metadata).categories[index])" :style="`background-color: ${color};`"></div>
                            </div>
                        </div>
                        <div class="srow">
                            <input id="colorSchemeActive" type="checkbox" v-model="metadata.colorConfig.colorSchemesActivated" @change="saveMetadata(metadata)"/>
                            <label for="colorSchemeActive">
                                <span>{{ $t('activateColorCategoriesOfGridElements') }}</span>
                            </label>
                        </div>
                    </accordion>
                </div>
                <h3 class="mt-5">{{ $t('grid') }}</h3>
                <div class="srow">
                    <label class="three columns" for="appColor">
                        <span>{{ $t('defaultGridBackgroundColor') }}</span>
                    </label>
                    <input id="appColor" v-model="metadata.colorConfig.gridBackgroundColor" class="five columns" type="color" @change="saveMetadata(metadata)">
                    <button class="three columns" @click="metadata.colorConfig.gridBackgroundColor = constants.DEFAULT_GRID_BACKGROUND_COLOR; saveMetadata(metadata)">{{ $t('reset') }}</button>
                </div>
                <div class="srow">
                    <label for="firstRowHeightFactor" class="three columns">{{ $t('firstRowHeightFactor') }}</label>
                    <input id="firstRowHeightFactor" type="number" class="five columns" v-model.number="metadata.firstRowHeightFactor" min="0.1" max="5" step="0.1" @change="saveMetadata(metadata)"/>
                </div>
            </div>
            <div class="three columns">
                <h3 class="mt-3">{{ $t('appearanceDemo') }}</h3>
                <div class="srow">
                    <label for="testElementLabel" class="me-2 u-full-width">{{ $t('testElementLabel') }}</label>
                    <input id="testElementLabel" class="u-full-width" type="text" v-model="testElementLabel" @input="resetTestGrid"/>
                </div>
                <app-grid-display v-if="testGridData" style="max-width: 200px; height: 500px;" :grid-data="testGridData" :metadata="metadata" :watch-for-changes="true"/>
            </div>
        </div>
    </div>
</template>

<script>
    import { TextConfig } from '../../../js/model/TextConfig';
    import { constants } from '../../../js/util/constants';
    import { settingsSaveMixin } from './settingsSaveMixin';
    import SliderInput from '../../modals/input/sliderInput.vue';
    import Accordion from '../../components/accordion.vue';
    import AppGridDisplay from '../../grid-display/appGridDisplay.vue';
    import { GridElement } from '../../../js/model/GridElement';
    import { i18nService } from '../../../js/service/i18nService';
    import { GridImage } from '../../../js/model/GridImage';
    import { GridData } from '../../../js/model/GridData';
    import { util } from '../../../js/util/util';
    import { ColorConfig } from '../../../js/model/ColorConfig';
    import {colorUtil} from "../../../js/util/colorUtil";

    export default {
        components: { AppGridDisplay, Accordion, SliderInput },
        props: ["metadata", "userSettingsLocal"],
        mixins: [settingsSaveMixin],
        data() {
            return {
                TextConfig: TextConfig,
                ColorConfig: ColorConfig,
                colorUtil: colorUtil,
                constants: constants,
                testGridData: null,
                testElementLabel: i18nService.t("testElement"),
            }
        },
        methods: {
            applyExperimentalStyle(style) {
                const config = this.metadata.colorConfig;
                config.experimentalStyle = style;
                if (style === 'classic') {
                    config.borderRadius = 0.4; config.elementMargin = 0.15;
                    config.borderWidth = ColorConfig.BORDER_WIDTH_BG_COLORED;
                    config.outerShadowEnabled = false; config.innerShadowEnabled = false;
                } else if (style === 'neon') {
                    config.borderRadius = 0.15; config.elementMargin = 0.35; config.borderWidth = 0.35;
                    config.outerShadowEnabled = true; config.outerShadowColor = '#00f5d4';
                    config.outerShadowOpacity = 90; config.outerShadowOffsetX = 0; config.outerShadowOffsetY = 0;
                    config.outerShadowBlur = 3; config.outerShadowSpread = 0.4; config.innerShadowEnabled = false;
                } else if (style === 'candy') {
                    config.borderRadius = 4; config.elementMargin = 0.5; config.borderWidth = 0.25;
                    config.outerShadowEnabled = true; config.outerShadowColor = '#d44d99';
                    config.outerShadowOpacity = 70; config.outerShadowOffsetX = 0; config.outerShadowOffsetY = 1.2;
                    config.outerShadowBlur = 0.5; config.outerShadowSpread = 0; config.innerShadowEnabled = false;
                } else if (style === 'brutalist') {
                    config.borderRadius = 0; config.elementMargin = 0.6; config.borderWidth = 0.45;
                    config.outerShadowEnabled = false; config.innerShadowEnabled = false;
                } else if (style === 'glass') {
                    config.borderRadius = 1.2; config.elementMargin = 0.4; config.borderWidth = 0.2;
                    config.outerShadowEnabled = true; config.outerShadowColor = '#6c9fca';
                    config.outerShadowOpacity = 35; config.outerShadowOffsetX = 0; config.outerShadowOffsetY = 0.8;
                    config.outerShadowBlur = 3; config.outerShadowSpread = 0; config.innerShadowEnabled = true;
                    config.innerShadowColor = '#ffffff'; config.innerShadowOpacity = 55;
                    config.innerShadowOffsetX = 0; config.innerShadowOffsetY = 0;
                    config.innerShadowBlur = 1.5; config.innerShadowSpread = 0;
                } else if (style === 'aurora') {
                    config.borderRadius = 1; config.elementMargin = 0.4; config.borderWidth = 0.2;
                    config.outerShadowEnabled = false; config.innerShadowEnabled = false;
                } else if (style === 'soft3d') {
                    config.borderRadius = 1.2; config.elementMargin = 0.5; config.borderWidth = 0.15;
                    config.outerShadowEnabled = false; config.innerShadowEnabled = false;
                } else if (style === 'outline') {
                    config.borderRadius = 0.5; config.elementMargin = 0.35; config.borderWidth = 0.2;
                    config.outerShadowEnabled = false; config.innerShadowEnabled = false;
                }
                this.saveMetadata(this.metadata);
            },
            applyShadowPreset(preset) {
                const config = this.metadata.colorConfig;
                if (preset === 'flat') {
                    config.outerShadowEnabled = false;
                    config.outerShadowOffsetX = 0;
                    config.outerShadowOffsetY = 0;
                    config.outerShadowBlur = 0;
                    config.outerShadowSpread = 0;
                    config.innerShadowEnabled = false;
                    config.innerShadowOffsetX = 0;
                    config.innerShadowOffsetY = 0;
                    config.innerShadowBlur = 0;
                    config.innerShadowSpread = 0;
                } else if (preset === 'soft') {
                    config.outerShadowOpacity = 28;
                    config.innerShadowOpacity = 28;
                    config.outerShadowEnabled = true;
                    config.outerShadowOffsetX = 0;
                    config.outerShadowOffsetY = 0.7;
                    config.outerShadowBlur = 2.5;
                    config.outerShadowSpread = 0;
                    config.innerShadowEnabled = false;
                    config.innerShadowOffsetX = 0;
                    config.innerShadowOffsetY = 0;
                    config.innerShadowBlur = 0;
                    config.innerShadowSpread = 0;
                } else if (preset === 'raised') {
                    config.outerShadowOpacity = 40;
                    config.innerShadowOpacity = 20;
                    config.outerShadowEnabled = true;
                    config.outerShadowOffsetX = 0;
                    config.outerShadowOffsetY = 1;
                    config.outerShadowBlur = 3;
                    config.outerShadowSpread = 0;
                    config.innerShadowEnabled = true;
                    config.innerShadowOffsetX = 0;
                    config.innerShadowOffsetY = 0.4;
                    config.innerShadowBlur = 1.5;
                    config.innerShadowSpread = 0;
                } else if (preset === 'pressed') {
                    config.outerShadowOpacity = 32;
                    config.innerShadowOpacity = 38;
                    config.outerShadowEnabled = false;
                    config.outerShadowOffsetX = 0;
                    config.outerShadowOffsetY = 0;
                    config.outerShadowBlur = 0;
                    config.outerShadowSpread = 0;
                    config.innerShadowEnabled = true;
                    config.innerShadowOffsetX = 0;
                    config.innerShadowOffsetY = 0.8;
                    config.innerShadowBlur = 2.5;
                    config.innerShadowSpread = 0;
                }
                this.saveMetadata(this.metadata);
            },
            toDefault() {
                this.metadata.textConfig = JSON.parse(JSON.stringify(new TextConfig()));
                this.metadata.colorConfig = JSON.parse(JSON.stringify(new ColorConfig()));
                this.saveMetadata(this.metadata);
            },
            toDefaultBgColored() {
                this.metadata.colorConfig.colorMode = ColorConfig.COLOR_MODE_BACKGROUND;
                this.metadata.colorConfig.borderWidth = ColorConfig.BORDER_WIDTH_BG_COLORED
                this.metadata.colorConfig.activeColorScheme = this.getColorScheme();
                this.saveMetadata(this.metadata);
            },
            toDefaultBorderColored() {
                this.metadata.colorConfig.colorMode = ColorConfig.COLOR_MODE_BORDER;
                this.metadata.colorConfig.borderWidth = ColorConfig.BORDER_WIDTH_BORDER_COLORED;
                this.metadata.colorConfig.activeColorScheme = this.getColorScheme();
                this.saveMetadata(this.metadata);
            },
            toDefaultBothColored() {
                this.metadata.colorConfig.colorMode = ColorConfig.COLOR_MODE_BOTH;
                this.metadata.colorConfig.borderWidth = ColorConfig.BORDER_WIDTH_BORDER_COLORED;
                this.metadata.colorConfig.activeColorScheme = this.getColorScheme();
                this.saveMetadata(this.metadata);
            },
            toDarkMode() {
                this.metadata.colorConfig.gridBackgroundColor = constants.DEFAULT_GRID_BACKGROUND_COLOR_DARK;
                this.metadata.colorConfig.elementBackgroundColor = constants.DEFAULT_ELEMENT_BACKGROUND_COLOR_DARK;
                this.metadata.textConfig.fontColor = constants.DEFAULT_ELEMENT_FONT_COLOR_DARK;
                this.metadata.colorConfig.activeColorScheme = this.getColorScheme();
                this.saveMetadata(this.metadata);
            },
            toLightMode() {
                this.metadata.colorConfig.gridBackgroundColor = constants.DEFAULT_GRID_BACKGROUND_COLOR;
                this.metadata.colorConfig.elementBackgroundColor = constants.DEFAULT_ELEMENT_BACKGROUND_COLOR;
                this.metadata.textConfig.fontColor = constants.DEFAULT_ELEMENT_FONT_COLOR;
                this.metadata.colorConfig.activeColorScheme = this.getColorScheme();
                this.saveMetadata(this.metadata);
            },
            getColorScheme() {
                let originalScheme = this.metadata.colorConfig.activeColorScheme;
                let borderColored = this.metadata.colorConfig.colorMode === ColorConfig.COLOR_MODE_BORDER;
                let backgroundColored = this.metadata.colorConfig.colorMode === ColorConfig.COLOR_MODE_BACKGROUND;
                let darkMode = this.metadata.colorConfig.elementBackgroundColor === constants.DEFAULT_ELEMENT_BACKGROUND_COLOR_DARK;
                if (originalScheme.startsWith(constants.COLOR_SCHEME_FITZGERALD_PREFIX)) {
                    if (backgroundColored) {
                        return darkMode ? constants.COLOR_SCHEME_FITZGERALD_DARK: constants.COLOR_SCHEME_FITZGERALD_LIGHT;
                    }
                    if (borderColored) {
                        return constants.COLOR_SCHEME_FITZGERALD_MEDIUM;
                    }
                    // both colored
                    return darkMode ? constants.COLOR_SCHEME_FITZGERALD_DARK : constants.COLOR_SCHEME_FITZGERALD_VERY_LIGHT;
                } else if (originalScheme.startsWith(constants.COLOR_SCHEME_GOOSENS_PREFIX)) {
                    if (backgroundColored) {
                        return darkMode ? constants.COLOR_SCHEME_GOOSENS_DARK: constants.COLOR_SCHEME_GOOSENS_LIGHT;
                    }
                    if (borderColored) {
                        return constants.COLOR_SCHEME_GOOSENS_MEDIUM;
                    }
                    // both colored
                    return darkMode ? constants.COLOR_SCHEME_GOOSENS_DARK : constants.COLOR_SCHEME_GOOSENS_VERY_LIGHT;
                } else if (originalScheme.startsWith(constants.COLOR_SCHEME_MONTESSORI_PREFIX)) {
                    if (backgroundColored) {
                        return darkMode ? constants.COLOR_SCHEME_MONTESSORI_DARK: constants.COLOR_SCHEME_MONTESSORI_LIGHT;
                    }
                    if (borderColored) {
                        return constants.COLOR_SCHEME_MONTESSORI_MEDIUM;
                    }
                    // both colored
                    return darkMode ? constants.COLOR_SCHEME_MONTESSORI_DARK: constants.COLOR_SCHEME_MONTESSORI_VERY_LIGHT;
                }
            },
            getElement(x, y, label, imgUrl, colorCategory) {
                return new GridElement({
                    x: x,
                    y: y,
                    label: i18nService.getTranslationObject(label),
                    image: new GridImage({
                        url: imgUrl
                    }),
                    colorCategory: colorCategory
                });
            },
            resetTestGrid() {
                util.debounce(() => {
                    this.testGridData = new GridData({
                        gridElements: [
                            this.getElement(0, 0, this.testElementLabel, "https://api.arasaac.org/api/pictograms/2648?download=false&plural=false&color=true"),
                            this.getElement(0, 1, i18nService.t("CC_VERB"), "https://api.arasaac.org/api/pictograms/4887?download=false&plural=false&color=true", "CC_VERB"),
                            this.getElement(0, 2, i18nService.t("CC_NOUN"), "https://api.arasaac.org/api/pictograms/2808?download=false&plural=false&color=true", "CC_NOUN"),
                            this.getElement(0, 3, this.testElementLabel),
                        ]
                    });
                }, 200, "RESET_TEST_GRD");

            }
        },
        async mounted() {
            this.resetTestGrid();
        }
    }
</script>

<style scoped>
    h2 {
        margin-bottom: 0.5em;
    }
    h3 {
        margin-bottom: 0.5em;
    }
    .srow {
        margin-bottom: 1.5em;
    }
    .settings-area {
        border-right: 1px solid lightgray;
    }
    @media (max-width: 849px) {
        .settings-area {
            border-right: 0;
        }
    }

    .experimental-appearance {
        padding: clamp(.75rem, 2vw, 1.5rem);
        border-radius: 1.25rem;
        background: radial-gradient(ellipse at top left, rgba(110, 150, 210, .10), transparent 52%), #fff;
        transition: background .2s ease, border-radius .2s ease;
    }
    .experimental-appearance h3 {
        padding: .65rem .85rem;
        border-left: 4px solid #7186a5;
        border-radius: 0 .65rem .65rem 0;
        background: rgba(115, 139, 174, .09);
        letter-spacing: .01em;
    }
    .experimental-appearance h4 { margin-bottom: .8rem; }
    .experimental-appearance .experimental-look-picker {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(125px, 1fr));
        gap: .65rem;
        margin: .9rem 0 1.6rem;
    }
    .experimental-appearance .experimental-look-picker button {
        min-height: 3.15rem;
        padding: .7rem .8rem;
        border: 1px solid rgba(85, 105, 135, .24);
        border-radius: .85rem;
        background: linear-gradient(145deg, #fff, #f3f6fa);
        box-shadow: 0 3px 8px rgba(30, 45, 65, .07);
        font-weight: 600;
        transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease;
    }
    .experimental-appearance .experimental-look-picker button:hover,
    .experimental-appearance .experimental-look-picker button:focus-visible {
        transform: translateY(-2px);
        box-shadow: 0 8px 16px rgba(30, 45, 65, .13);
    }
    .experimental-appearance .experimental-look-picker button.is-active {
        border: 2px solid #557fc2;
        background: linear-gradient(135deg, #eaf3ff, #fff);
        box-shadow: 0 0 0 3px rgba(85,127,194,.14), 0 6px 14px rgba(30,65,115,.12);
    }
    .experimental-appearance input:not([type="checkbox"]):not([type="color"]),
    .experimental-appearance select {
        min-height: 2.6rem;
        border-radius: .55rem;
    }
    .experimental-appearance input[type="color"] {
        min-height: 2.6rem;
        padding: .2rem;
        border-radius: .55rem;
        cursor: pointer;
    }
    .experimental-appearance button {
        transition: box-shadow .16s ease, transform .16s ease;
    }
    .experimental-appearance button:hover { box-shadow: 0 4px 10px rgba(25, 40, 60, .12); }
    .experimental-appearance.interface-skin-glass {
        background: radial-gradient(ellipse at 8% 0%, rgba(166, 215, 255, .34), transparent 42%), linear-gradient(135deg, #f7fbff, #eef5fb 55%, #f9fcff);
        border: 1px solid rgba(255,255,255,.9);
        box-shadow: inset 0 1px 0 #fff, 0 12px 32px rgba(60,100,140,.09);
    }
    .experimental-appearance.interface-skin-glass h3 {
        border-left-color: #77a9d4;
        background: linear-gradient(100deg, rgba(255,255,255,.88), rgba(220,239,255,.55));
        box-shadow: inset 0 1px 0 rgba(255,255,255,.9);
    }
    .experimental-appearance.interface-skin-aurora {
        background: linear-gradient(130deg, #f3f7ff, #f8efff 48%, #edfffa);
    }
    .experimental-appearance.interface-skin-aurora h3 {
        border-left-color: #8a70d5;
        background: linear-gradient(100deg, rgba(215,204,255,.28), rgba(177,245,226,.25));
    }
    .experimental-appearance.interface-skin-neon { background: #111322; color: #f3f5ff; }
    .experimental-appearance.interface-skin-neon h3 {
        color: #fff;
        border-left-color: #00f5d4;
        background: #20243a;
    }
    .experimental-appearance.interface-skin-neon .experimental-look-picker button {
        color: #f6ffff;
        background: #20243a;
        border-color: rgba(0,245,212,.4);
        border-radius: .3rem;
    }
    .experimental-appearance.interface-skin-neon .experimental-look-picker button.is-active {
        border-color: #ff2bd6;
        box-shadow: 0 0 0 2px rgba(255,43,214,.25), 0 0 18px rgba(0,245,212,.2);
    }
    .experimental-appearance.interface-skin-candy {
        background: linear-gradient(140deg, #fff6fb, #f3f1ff);
        border-radius: 1.8rem;
    }
    .experimental-appearance.interface-skin-candy h3 { border-left-color: #d44d99; background: rgba(255,218,238,.48); border-radius: 0 1rem 1rem 0; }
    .experimental-appearance.interface-skin-candy .experimental-look-picker button { border-radius: 1.25rem; border-color: #efc2dc; }
    .experimental-appearance.interface-skin-brutalist { background: #f4f1e8; border: 3px solid #171717; border-radius: 0; box-shadow: 7px 7px 0 #171717; }
    .experimental-appearance.interface-skin-brutalist h3 { color: #171717; border: 2px solid #171717; border-left-width: 8px; border-radius: 0; background: #fff; }
    .experimental-appearance.interface-skin-brutalist .experimental-look-picker button { border: 2px solid #171717; border-radius: 0; box-shadow: 3px 3px 0 #171717; }
    .experimental-appearance.interface-skin-soft3d { background: #e8edf4; box-shadow: inset 4px 4px 12px rgba(90,105,125,.09), inset -4px -4px 12px rgba(255,255,255,.8); }
    .experimental-appearance.interface-skin-soft3d h3 { border: 0; border-radius: 1rem; background: #e8edf4; box-shadow: 5px 5px 10px rgba(90,105,125,.16), -4px -4px 10px rgba(255,255,255,.9); }
    .experimental-appearance.interface-skin-outline { background: transparent; border: 2px solid currentColor; border-radius: .3rem; }
    .experimental-appearance.interface-skin-outline h3 { border: 2px solid currentColor; border-left-width: 6px; border-radius: 0; background: transparent; }
    @media (max-width: 640px) {
        .experimental-appearance { padding: .65rem; border-radius: .8rem; }
        .experimental-appearance .experimental-look-picker { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .experimental-appearance .experimental-look-picker button { min-height: 3rem; padding: .6rem .4rem; }
    }
    @media (prefers-reduced-motion: reduce) {
        .experimental-appearance, .experimental-appearance button { transition: none; }
        .experimental-appearance button:hover, .experimental-appearance .experimental-look-picker button:hover { transform: none; }
    }

</style>