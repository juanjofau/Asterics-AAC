<template>
    <div>
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
                <div class="srow">
                    <input id="textBackgroundEnabled" type="checkbox" v-model="metadata.textConfig.textBackgroundEnabled" @change="saveMetadata(metadata)"/>
                    <label for="textBackgroundEnabled">{{ $t('textBackground') }}</label>
                </div>
                <div class="srow">
                    <input id="textOverlay" type="checkbox" v-model="metadata.textConfig.textOverlay" @change="saveMetadata(metadata)"/>
                    <label for="textOverlay">{{ $t('overlayText') }}</label>
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
                        <div class="srow" v-if="metadata.textConfig.textBackgroundEnabled">
                            <label class="three columns" for="textBackgroundColor">
                                <span>{{ $t('textBackgroundColor') }}</span>
                            </label>
                            <input id="textBackgroundColor" v-model="metadata.textConfig.textBackgroundColor" class="five columns" type="color" @change="saveMetadata(metadata)">
                            <button class="three columns" @click="metadata.textConfig.textBackgroundColor = '#000000'; saveMetadata(metadata)">{{ $t('reset') }}</button>
                        </div>
                        <div class="srow" v-if="metadata.textConfig.textBackgroundEnabled">
                            <slider-input label="textBackgroundOpacity" unit="%" id="textBackgroundOpacity" min="0" max="100" step="1" v-model.number="metadata.textConfig.textBackgroundOpacity" @change="saveMetadata(metadata)"/>
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
                        <div class="srow">
                            <input id="gradientEnabled" type="checkbox" v-model="metadata.colorConfig.gradientEnabled" @change="saveMetadata(metadata)"/>
                            <label for="gradientEnabled">{{ $t('enableCellGradient') }}</label>
                        </div>
                        <div class="srow">
                            <slider-input label="cellGradientWhiteOpacity" unit="%" id="gradientWhiteOpacity" min="0" max="100" step="1" v-model.number="metadata.colorConfig.gradientWhiteOpacity" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <slider-input label="cellGradientBlackOpacity" unit="%" id="gradientBlackOpacity" min="0" max="100" step="1" v-model.number="metadata.colorConfig.gradientBlackOpacity" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <input id="shadowEnabled" type="checkbox" v-model="metadata.colorConfig.shadowEnabled" @change="saveMetadata(metadata)"/>
                            <label for="shadowEnabled">{{ $t('enableCellShadow') }}</label>
                        </div>
                        <div class="srow">
                            <slider-input label="cellShadowOffset" unit="px" id="shadowOffsetY" min="0" max="50" step="1" v-model.number="metadata.colorConfig.shadowOffsetY" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <slider-input label="cellShadowBlur" unit="px" id="shadowBlur" min="0" max="50" step="1" v-model.number="metadata.colorConfig.shadowBlur" @change="saveMetadata(metadata)"/>
                        </div>
                        <div class="srow">
                            <slider-input label="cellShadowOpacity" unit="%" id="shadowOpacity" min="0" max="100" step="1" v-model.number="metadata.colorConfig.shadowOpacity" @change="saveMetadata(metadata)"/>
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
                <h3 class="mt-5">{{ $t('navigationIndicator') }}</h3>

                <div class="srow">
                    <input id="navigationIndicatorEnabled"
                           type="checkbox"
                           v-model="metadata.colorConfig.navigationIndicatorEnabled"
                           @change="saveMetadata(metadata)"/>
                    <label for="navigationIndicatorEnabled">{{ $t('navigationIndicatorEnabled') }}</label>
                </div>

                <template v-if="metadata.colorConfig.navigationIndicatorEnabled">
                    <div class="srow">
                        <label class="three columns" for="navigationIndicatorShape">
                            {{ $t('navigationIndicatorShape') }}
                        </label>
                        <select id="navigationIndicatorShape"
                                v-model="metadata.colorConfig.navigationIndicatorShape"
                                class="five columns"
                                @change="saveMetadata(metadata)">
                            <option :value="ColorConfig.NAV_INDICATOR_SHAPE_SQUARE">{{ $t('navigationIndicatorShapeSquare') }}</option>
                            <option :value="ColorConfig.NAV_INDICATOR_SHAPE_CORNER">{{ $t('navigationIndicatorShapeCorner') }}</option>
                            <option :value="ColorConfig.NAV_INDICATOR_SHAPE_TAB">{{ $t('navigationIndicatorShapeTab') }}</option>
                            <option :value="ColorConfig.NAV_INDICATOR_SHAPE_CIRCLE">{{ $t('navigationIndicatorShapeCircle') }}</option>
                        </select>
                    </div>

                    <div class="srow">
                        <label class="three columns" for="navigationIndicatorIcon">
                            {{ $t('navigationIndicatorIcon') }}
                        </label>
                        <select id="navigationIndicatorIcon"
                                v-model="metadata.colorConfig.navigationIndicatorIcon"
                                class="five columns"
                                @change="saveMetadata(metadata)">
                            <option :value="ColorConfig.NAV_INDICATOR_ICON_NONE">{{ $t('navigationIndicatorIconNone') }}</option>
                            <option :value="ColorConfig.NAV_INDICATOR_ICON_ARROW">{{ $t('navigationIndicatorIconArrow') }}</option>
                            <option :value="ColorConfig.NAV_INDICATOR_ICON_FOLDER">{{ $t('navigationIndicatorIconFolder') }}</option>
                            <option :value="ColorConfig.NAV_INDICATOR_ICON_FOLDER_OPEN">{{ $t('navigationIndicatorIconFolderOpen') }}</option>
                            <option :value="ColorConfig.NAV_INDICATOR_ICON_SIGN_OUT_ALT">{{ $t('navigationIndicatorIconSignOutAlt') }}</option>
                            <option :value="ColorConfig.NAV_INDICATOR_ICON_SQUARE">{{ $t('navigationIndicatorIconSquare') }}</option>
                            <option :value="ColorConfig.NAV_INDICATOR_ICON_STICKY_NOTE">{{ $t('navigationIndicatorIconStickyNote') }}</option>
                            <option :value="ColorConfig.NAV_INDICATOR_ICON_TH">{{ $t('navigationIndicatorIconTh') }}</option>
                            <option :value="ColorConfig.NAV_INDICATOR_ICON_TH_LARGE">{{ $t('navigationIndicatorIconThLarge') }}</option>
                            <option :value="ColorConfig.NAV_INDICATOR_ICON_DOT_CIRCLE">
                                {{ $t('navigationIndicatorIconDotCircle') }}
                            </option>
                            <option :value="ColorConfig.NAV_INDICATOR_ICON_CIRCLE">
                                {{ $t('navigationIndicatorIconCircle') }}
                            </option>
                        </select>
                    </div>

                    <div class="srow">
                        <slider-input
                            label="navigationIndicatorSize"
                            unit="%"
                            id="navigationIndicatorSize"
                            :min="ColorConfig.NAV_INDICATOR_SIZE_MIN"
                            :max="ColorConfig.NAV_INDICATOR_SIZE_MAX"
                            step="1"
                            v-model.number="metadata.colorConfig.navigationIndicatorSize"
                            @change="saveMetadata(metadata)"/>
                    </div>

                    <div class="srow mb-0">
                        <accordion :acc-label="$t('advancedOptions')" class="eleven columns">
                            <div class="srow">
                                <input id="navigationIndicatorAutoColor"
                                       type="checkbox"
                                       v-model="metadata.colorConfig.navigationIndicatorAutoColor"
                                       @change="saveMetadata(metadata)"/>
                                <label for="navigationIndicatorAutoColor">{{ $t('navigationIndicatorAutoColor') }}</label>
                            </div>
                            <div class="srow">
                                <label class="three columns" for="navigationIndicatorColor">{{ $t('navigationIndicatorColor') }}</label>
                                <input id="navigationIndicatorColor"
                                       v-model="metadata.colorConfig.navigationIndicatorColor"
                                       class="five columns"
                                       type="color"
                                       :disabled="metadata.colorConfig.navigationIndicatorAutoColor"
                                       @change="saveMetadata(metadata)">
                                <button class="three columns"
                                        :disabled="metadata.colorConfig.navigationIndicatorAutoColor"
                                        @click="metadata.colorConfig.navigationIndicatorColor = ColorConfig.NAV_INDICATOR_COLOR_DEFAULT; saveMetadata(metadata)">
                                    {{ $t('reset') }}
                                </button>
                            </div>
                            <div class="srow">
                                <slider-input
                                    label="navigationIndicatorOpacity"
                                    unit="%"
                                    id="navigationIndicatorOpacity"
                                    min="0"
                                    max="100"
                                    step="1"
                                    v-model.number="metadata.colorConfig.navigationIndicatorOpacity"
                                    @change="saveMetadata(metadata)"/>
                            </div>
                            <template v-if="metadata.colorConfig.navigationIndicatorIcon !== ColorConfig.NAV_INDICATOR_ICON_NONE">
                                <div class="srow">
                                    <input id="navigationIndicatorIconAutoColor"
                                           type="checkbox"
                                           v-model="metadata.colorConfig.navigationIndicatorIconAutoColor"
                                           @change="saveMetadata(metadata)"/>
                                    <label for="navigationIndicatorIconAutoColor">{{ $t('navigationIndicatorIconAutoColor') }}</label>
                                </div>
                                <div class="srow">
                                    <label class="three columns" for="navigationIndicatorIconColor">{{ $t('navigationIndicatorIconColor') }}</label>
                                    <input id="navigationIndicatorIconColor"
                                           v-model="metadata.colorConfig.navigationIndicatorIconColor"
                                           class="five columns"
                                           type="color"
                                           :disabled="metadata.colorConfig.navigationIndicatorIconAutoColor"
                                           @change="saveMetadata(metadata)">
                                    <button class="three columns"
                                            :disabled="metadata.colorConfig.navigationIndicatorIconAutoColor"
                                            @click="metadata.colorConfig.navigationIndicatorIconColor = ColorConfig.NAV_INDICATOR_ICON_COLOR_DEFAULT; saveMetadata(metadata)">
                                        {{ $t('reset') }}
                                    </button>
                                </div>
                            </template>
                        </accordion>
                    </div>
                </template>

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
                <app-grid-display v-if="testGridData"
                                  style="max-width: 200px; height: 750px; pointer-events: none;"
                                  :grid-data="testGridData"
                                  :metadata="metadata"
                                  :watch-for-changes="true"
                                  aria-hidden="true"
                                  inert/>
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
    import { GridActionNavigate } from '../../../js/model/GridActionNavigate';
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
        created() {
            const config = this.metadata.colorConfig;
            if (config.navigationIndicatorShape === 'wide-tab') {
                this.$set(config, 'navigationIndicatorShape', ColorConfig.NAV_INDICATOR_SHAPE_TAB);
            }
            const legacyStyle = config.navigationIndicatorStyle;

            if (config.navigationIndicatorEnabled === undefined) {
                this.$set(config, 'navigationIndicatorEnabled',
                    legacyStyle !== ColorConfig.NAV_INDICATOR_STYLE_NONE);
            }

            if (config.navigationIndicatorShape === undefined) {
                const legacyShapes = {
                    [ColorConfig.NAV_INDICATOR_STYLE_ICON]: ColorConfig.NAV_INDICATOR_SHAPE_SQUARE,
                    [ColorConfig.NAV_INDICATOR_STYLE_SHADED]: ColorConfig.NAV_INDICATOR_SHAPE_CORNER,
                    [ColorConfig.NAV_INDICATOR_STYLE_TAB]: ColorConfig.NAV_INDICATOR_SHAPE_TAB,
                    [ColorConfig.NAV_INDICATOR_STYLE_NONE]: ColorConfig.NAV_INDICATOR_SHAPE_SQUARE
                };
                this.$set(config, 'navigationIndicatorShape',
                    legacyShapes[legacyStyle] || ColorConfig.NAV_INDICATOR_SHAPE_SQUARE);

                if (legacyStyle === ColorConfig.NAV_INDICATOR_STYLE_SHADED ||
                    legacyStyle === ColorConfig.NAV_INDICATOR_STYLE_TAB) {
                    this.$set(config, 'navigationIndicatorIcon', ColorConfig.NAV_INDICATOR_ICON_NONE);
                }
            }

            if (config.navigationIndicatorIconAutoColor === undefined) {
                this.$set(config, 'navigationIndicatorIconAutoColor', true);
            }
            if (config.navigationIndicatorIconColor === undefined) {
                this.$set(config, 'navigationIndicatorIconColor',
                    ColorConfig.NAV_INDICATOR_ICON_COLOR_DEFAULT);
            }
        },
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
                    const testElementWithImage = this.getElement(
                        0,
                        0,
                        this.testElementLabel,
                        "https://api.arasaac.org/api/pictograms/2648?download=false&plural=false&color=true"
                    );

                    const navigationPreviewElement = this.getElement(
                        0,
                        4,
                        i18nService.t("navigation"),
                        "https://api.arasaac.org/api/pictograms/2317?download=false&plural=false&color=true"
                    );
                    navigationPreviewElement.backgroundColor = "#f3f3f3";
                    navigationPreviewElement.actions = [
                        new GridActionNavigate({
                            navType: GridActionNavigate.NAV_TYPES.TO_HOME
                        })
                    ];

                    const darkNavigationPreviewElement = this.getElement(
                        0,
                        5,
                        i18nService.t("navigation"),
                        "https://api.arasaac.org/api/pictograms/2317?download=false&plural=false&color=true"
                    );
                    darkNavigationPreviewElement.backgroundColor = "#484848";
                    darkNavigationPreviewElement.actions = [
                        new GridActionNavigate({
                            navType: GridActionNavigate.NAV_TYPES.TO_HOME
                        })
                    ];

                    this.testGridData = new GridData({
                        gridElements: [
                            testElementWithImage,
                            this.getElement(0, 1, i18nService.t("CC_VERB"), "https://api.arasaac.org/api/pictograms/4887?download=false&plural=false&color=true", "CC_VERB"),
                            this.getElement(0, 2, i18nService.t("CC_NOUN"), "https://api.arasaac.org/api/pictograms/2808?download=false&plural=false&color=true", "CC_NOUN"),
                            this.getElement(0, 3, this.testElementLabel),
                            navigationPreviewElement,
                            darkNavigationPreviewElement,
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
</style>