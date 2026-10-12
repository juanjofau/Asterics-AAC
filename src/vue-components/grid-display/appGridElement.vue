<template>
    <div v-if="element.type !== GridElement.ELEMENT_TYPE_UI_FILLER" role="button" class="element-container" ref="container" tabindex="40" :aria-label="getAriaLabel(element)" :data-empty="isEmpty(element)"
         :style="`margin: ${elementMarginPx}px; border-radius: ${borderRadiusPx}px; cursor: ${cursorType};
         border: ${borderWidthPx}px solid ${borderColor}; background-color: ${backgroundColor}; background-image: ${gradientBackgroundImage}; box-shadow: ${shadowStyle}; font-family: ${metadata.textConfig.fontFamily}; color: ${fontColor}`">
        <grid-element-normal v-if="element.type === GridElement.ELEMENT_TYPE_NORMAL" :grid-element="element" :metadata="metadata" :container-size="calculatedSize" v-bind="$props" aria-hidden="true"/>
        <grid-element-collect v-if="element.type === GridElement.ELEMENT_TYPE_COLLECT" :metadata="metadata" aria-hidden="true"/>
        <grid-element-youtube v-if="element.type === GridElement.ELEMENT_TYPE_YT_PLAYER" :grid-element="element" aria-hidden="true"/>
        <grid-element-predict v-if="element.type === GridElement.ELEMENT_TYPE_PREDICTION" :grid-element="element" :metadata="metadata" :container-size="calculatedSize" v-bind="$props" aria-hidden="true"/>
        <grid-element-live v-if="element.type === GridElement.ELEMENT_TYPE_LIVE" :grid-element="element" :metadata="metadata" :container-size="calculatedSize" v-bind="$props" aria-hidden="true"/>
        <grid-element-matrix-conversation v-if="element.type === GridElement.ELEMENT_TYPE_MATRIX_CONVERSATION" :grid-element="element" :metadata="metadata" aria-hidden="true"/>
        <grid-element-child-placeholder v-if="element.type === GridElement.ELEMENT_TYPE_DYNAMIC_GRID_PLACEHOLDER"/>
        <grid-element-hints :grid-element="element" :metadata="metadata" :background-color="backgroundColor" :container-size="calculatedSize" :border-color="borderColor" :border-width-px="borderWidthPx"/>
        <div v-if="showResizeHandle" class="ui-resizable-handle ui-icon ui-icon-grip-diagonal-se" style="position: absolute; z-index: 6; bottom: 0; right: 0; cursor: se-resize; pointer-events: auto;"></div>
    </div>
    <div
        v-else-if="!editable"
        class="empty-cell-shadow"
        aria-hidden="true"
        :style="`margin: ${elementMarginPx}px; border-radius: ${borderRadiusPx}px; background-color: ${emptyCellEffectColor};`">
    </div>
</template>

<script>

import { GridElement as GridElementModel, GridElement } from '../../js/model/GridElement';
import GridElementPredict from './grid-elements/gridElementPredict.vue';
import GridElementHints from './grid-elements/gridElementHints.vue';
import GridElementCollect from './grid-elements/gridElementCollect.vue';
import GridElementYoutube from './grid-elements/gridElementYoutube.vue';
import GridElementNormal from './grid-elements/gridElementNormal.vue';
import { constants } from '../../js/util/constants';
import { fontUtil } from '../../js/util/fontUtil';
import { MetaData } from '../../js/model/MetaData';
import { stateService } from '../../js/service/stateService';
import { i18nService } from '../../js/service/i18nService';
import { GridActionSpeakCustom } from '../../js/model/GridActionSpeakCustom';
import { GridActionSpeak } from '../../js/model/GridActionSpeak';
import { GridActionPredict } from '../../js/model/GridActionPredict';
import { GridActionChangeLang } from '../../js/model/GridActionChangeLang';
import { GridActionCollectElement } from '../../js/model/GridActionCollectElement';
import { GridActionNavigate } from '../../js/model/GridActionNavigate';
import { GridActionWebradio } from '../../js/model/GridActionWebradio';
import { GridActionYoutube } from '../../js/model/GridActionYoutube';
import { ColorConfig } from '../../js/model/ColorConfig';
import GridElementLive from './grid-elements/gridElementLive.vue';
import GridElementMatrixConversation from './grid-elements/gridElementMatrixConversation.vue';
import { gridUtil } from '../../js/util/gridUtil';
import GridElementChildPlaceholder from './grid-elements/gridElementChildPlaceholder.vue';
import {colorUtil} from "../../js/util/colorUtil";

export default {
    components: { GridElementChildPlaceholder, GridElementMatrixConversation, GridElementLive, GridElementNormal, GridElementYoutube, GridElementCollect, GridElementHints, GridElementPredict },
    props: ["element", "metadata", "showResizeHandle", "editable", "oneElementSize", "watchForChanges", "gridBackgroundColor"],
    data() {
        return {
            GridElement: GridElement,
            resizeObserver: null,
            elementMarginPx: fontUtil.pctToPx(this.metadata.colorConfig.elementMargin),
            borderRadiusPx: fontUtil.pctToPx(this.metadata.colorConfig.borderRadius),
            borderWidthPx: fontUtil.pctToPx(this.metadata.colorConfig.borderWidth)
        }
    },
    computed: {
        calculatedSize() {
            return {
                width: this.oneElementSize.width * this.element.width - 2 * this.getElementMargin() - 2 * this.getBorderWidth(),
                height: this.oneElementSize.height * this.element.height - 2 * this.getElementMargin() - 2 * this.getBorderWidth()
            }
        },
        backgroundColor() {
            return colorUtil.getBackgroundColor(this.element, this.metadata);
        },
        fontColor() {
            const hasImage =
                this.element.type === GridElement.ELEMENT_TYPE_NORMAL &&
                !!(this.element.image &&
                   (this.element.image.data || this.element.image.url));

            return colorUtil.getFontColor(
                this.metadata,
                this.backgroundColor,
                hasImage
            );
        },
        borderColor() {
            return colorUtil.getBorderColor(this.element, this.metadata);
        },
        emptyCellEffectColor() {
            const config = this.metadata.colorConfig;
            const opacity = Math.max(1, Math.min(20, Number(config.emptyCellEffectOpacity) || 1)) / 100;
            if (config.emptyCellEffectEnabled === false || opacity === 0) {
                return 'transparent';
            }
            const background = this.gridBackgroundColor || '#ffffff';
            const match = /^#([0-9a-f]{6})$/i.exec(background);
            const hex = match ? match[1] : 'ffffff';
            const red = parseInt(hex.slice(0, 2), 16);
            const green = parseInt(hex.slice(2, 4), 16);
            const blue = parseInt(hex.slice(4, 6), 16);
            const luminance = red * 0.299 + green * 0.587 + blue * 0.114;
            const color = luminance <= 255 * 0.20 ? '255, 255, 255' : '0, 0, 0';
            return 'rgba(' + color + ', ' + opacity + ')';
        },
        gradientBackgroundImage() {
            if (!this.metadata.colorConfig.gradientEnabled) {
                return 'none';
            }
            const topLightness = Math.max(0, Math.min(50, Number(this.metadata.colorConfig.gradientTopLightness) || 0));
            const bottomDarkness = Math.max(0, Math.min(50, Number(this.metadata.colorConfig.gradientBottomDarkness) || 0));
            if (topLightness === 0 && bottomDarkness === 0) {
                return 'none';
            }

            const adjustLightness = (hexColor, amount) => {
                const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hexColor || '');
                if (!match) {
                    return hexColor;
                }

                const hex = match[1].length === 3
                    ? match[1].split('').map(char => char + char).join('')
                    : match[1];
                const red = parseInt(hex.slice(0, 2), 16) / 255;
                const green = parseInt(hex.slice(2, 4), 16) / 255;
                const blue = parseInt(hex.slice(4, 6), 16) / 255;
                const max = Math.max(red, green, blue);
                const min = Math.min(red, green, blue);
                const delta = max - min;
                let hue = 0;
                let saturation = 0;
                let lightness = (max + min) / 2;

                if (delta !== 0) {
                    saturation = delta / (1 - Math.abs(2 * lightness - 1));
                    if (max === red) {
                        hue = 60 * (((green - blue) / delta) % 6);
                    } else if (max === green) {
                        hue = 60 * ((blue - red) / delta + 2);
                    } else {
                        hue = 60 * ((red - green) / delta + 4);
                    }
                    if (hue < 0) {
                        hue += 360;
                    }
                }

                lightness = Math.max(0, Math.min(1, lightness + amount / 100));
                const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
                const hueSection = hue / 60;
                const secondary = chroma * (1 - Math.abs((hueSection % 2) - 1));
                let rgb;
                if (hueSection < 1) {
                    rgb = [chroma, secondary, 0];
                } else if (hueSection < 2) {
                    rgb = [secondary, chroma, 0];
                } else if (hueSection < 3) {
                    rgb = [0, chroma, secondary];
                } else if (hueSection < 4) {
                    rgb = [0, secondary, chroma];
                } else if (hueSection < 5) {
                    rgb = [secondary, 0, chroma];
                } else {
                    rgb = [chroma, 0, secondary];
                }
                const offset = lightness - chroma / 2;
                return '#' + rgb.map(value =>
                    Math.round((value + offset) * 255).toString(16).padStart(2, '0')
                ).join('');
            };

            const topColor = adjustLightness(this.backgroundColor, topLightness);
            const bottomColor = adjustLightness(this.backgroundColor, -bottomDarkness);
            return 'linear-gradient(to bottom, ' + topColor + ' 0%, ' + this.backgroundColor + ' 50%, ' + bottomColor + ' 100%)';
        },
        shadowStyle() {
            if (!this.metadata.colorConfig.shadowEnabled) {
                return 'none';
            }
            const offsetY = Math.max(0, Math.min(100, Number(this.metadata.colorConfig.shadowOffsetY) || 0));
            const blur = Math.max(0, Math.min(100, Number(this.metadata.colorConfig.shadowBlur) || 0));
            const opacity = Math.max(0, Math.min(100, Number(this.metadata.colorConfig.shadowOpacity) || 0)) / 100;
            const outerShadow = offsetY === 0 && blur === 0 && opacity === 0
                ? ''
                : '0 ' + offsetY + 'px ' + blur + 'px 0 rgba(0, 0, 0, ' + opacity + ')';

            // Sombra interior más marcada; en fondos oscuros se utiliza blanco.
            const backgroundMatch = /^#([0-9a-f]{6})$/i.exec(this.backgroundColor || '');
            const fallbackMatch = /^#([0-9a-f]{6})$/i.exec(
                this.gridBackgroundColor || this.metadata.colorConfig.gridBackgroundColor || '#ffffff'
            );
            const hex = (backgroundMatch || fallbackMatch || [null, 'ffffff'])[1];
            const red = parseInt(hex.slice(0, 2), 16);
            const green = parseInt(hex.slice(2, 4), 16);
            const blue = parseInt(hex.slice(4, 6), 16);
            const luminance = red * 0.299 + green * 0.587 + blue * 0.114;
            const insetColor = luminance <= 51 ? '255, 255, 255' : '0, 0, 0';
            const insetOpacity = 0.30;
            const insetShadow = 'inset 0 0 12px 10px rgba(' + insetColor + ', ' + insetOpacity + ')';

            return [outerShadow, insetShadow].filter(Boolean).join(', ');
        },
        cursorType() {
            return gridUtil.getCursorType(this.metadata, "pointer");
        }
    },
    methods: {
        isEmpty(element) {
            if (element.type === GridElementModel.ELEMENT_TYPE_NORMAL) {
                return !stateService.getDisplayText(element.id) && (!element.image || (!element.image.url && !element.image.data));
            }
            return false;
        },
        getAriaLabel(gridElem) {
            let label = i18nService.getTranslation(gridElem.label);
            let ariaLabel = label ? label + ', ' : '';
            let singleCharMapping = {
                ':': 'colon',
                '.': 'period',
                ',': 'comma',
                '!': 'exclamationMark',
                '?': 'questionMark',
                '"': 'quotationMark',
                '-': 'hyphen',
                ' ': 'space'
            };

            if (Object.keys(singleCharMapping).includes(label)) {
                ariaLabel = i18nService.t(singleCharMapping[label]) + ', ';
            }

            let speakCustomAction = gridElem.actions.filter((a) => a.modelName === GridActionSpeakCustom.getModelName())[0];
            if (!ariaLabel && speakCustomAction) {
                ariaLabel = i18nService.getTranslation(speakCustomAction.speakText) + ', ';
            }

            let actions = gridElem.actions.filter(
                (a) =>
                    a.modelName !== GridActionSpeak.getModelName() &&
                    a.modelName !== GridActionSpeakCustom.getModelName() &&
                    a.modelName !== GridActionPredict.getModelName()
            );
            ariaLabel += actions.reduce((total, action) => {
                switch (action.modelName) {
                    case GridActionChangeLang.getModelName():
                        total += i18nService.t(GridActionChangeLang.getModelName());
                        total += ' ' + i18nService.getLangReadable(action.language);
                        total += ', ';
                        break;
                    case GridActionCollectElement.getModelName():
                        total += i18nService.t(action.action);
                        total += ', ';
                        break;
                    case GridActionNavigate.getModelName():
                        if (action.navType === GridActionNavigate.NAV_TYPES.TO_LAST) {
                            total += i18nService.t('navigateToLastOpenedGrid');
                        } else if (action.navType === GridActionNavigate.NAV_TYPES.TO_HOME) {
                            total += i18nService.t('navigateToHomeGrid');
                        } else {
                            total += i18nService.t('navigation');
                        }
                        total += ', ';
                        break;
                    case GridActionWebradio.getModelName():
                        total += i18nService.t(GridActionWebradio.getModelName());
                        total += ' ' + i18nService.t(action.action);
                        total += ', ';
                        break;
                    case GridActionYoutube.getModelName():
                        total += i18nService.t(GridActionYoutube.getModelName());
                        total += ' ' + i18nService.t(action.action);
                        total += ', ';
                        break;
                    default:
                        total += i18nService.t(action.modelName);
                        total += ', ';
                        break;
                }
                return total;
            }, '');
            if (ariaLabel.endsWith(', ')) {
                ariaLabel = ariaLabel.slice(0, -2);
            }
            return ariaLabel;
        },
        async recalculate() {
            if (!this.$refs.container) {
                return;
            }
            this.elementMarginPx = this.getElementMargin();
            this.borderWidthPx = this.getBorderWidth();
            this.borderRadiusPx = fontUtil.pctToPx(this.metadata.colorConfig.borderRadius);
        },
        getElementMargin() {
            return fontUtil.pctToPx(this.metadata.colorConfig.elementMargin);
        },
        getBorderWidth() {
            return fontUtil.pctToPx(this.metadata.colorConfig.borderWidth);
        }
    },
    async mounted() {
        if (this.editable || this.watchForChanges) {
            this.$watch("metadata", () => {
                this.recalculate();
            }, { deep: true });
            this.$watch("element", () => {
                this.recalculate();
            }, { deep: true });
        }
    }
}
</script>

<style scoped>
.element-container {
    display: flex;
    flex: 1 1 auto;
    overflow: hidden;
    position: relative;
}

.empty-cell-shadow {
    display: flex;
    flex: 1 1 auto;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    pointer-events: none;
}

</style>