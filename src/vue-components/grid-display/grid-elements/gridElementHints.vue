<template>
    <div class="grid-element-hints">
        <div v-if="hasNavigation && isGeometricIndicator"
             class="navigation-indicator-shape"
             :class="'navigation-indicator-' + navigationIndicatorStyle"
             :style="navigationShapeStyle"
             aria-hidden="true"></div>

        <div class="element-hints-content"
             :style="`color: ${hintsColor}; top: ${topPx}; bottom: ${bottomPx}`">

            <i v-if="gridElement.hidden"
               class="fas fa-eye-slash element-hint"></i>

            <i v-if="hasNavigation && isIconIndicator"
               :class="navigationIconClasses"
               :style="navigationIconStyle"
               aria-hidden="true"></i>

            <span v-if="gridElement.vocabularyLevel && isOnEdit"
                  class="element-hint d-inline-block"
                  :style="`outline: 1px solid; padding-left: 0.25em; padding-right: 0.25em; border-radius: 2px; font-weight: ${elementLevelShown ? 'bold' : 'normal'}`">{{ gridElement.vocabularyLevel }}</span>
        </div>
    </div>
</template>

<script>

import { GridActionNavigate } from '../../../js/model/GridActionNavigate';
import { ColorConfig } from '../../../js/model/ColorConfig';
import { TextConfig } from '../../../js/model/TextConfig';
import { Router } from '../../../js/router';
import { fontUtil } from '../../../js/util/fontUtil';

export default {
    props: ["gridElement", "metadata", "backgroundColor", "containerSize"],
    data() {
        return {
            isOnEdit: Router.isOnEditPage()
        }
    },
    computed: {
        hasNavigation() {
            return !!this.gridElement.actions.find(
                (a) => a.modelName === GridActionNavigate.getModelName()
            );
        },
        topPx() {
            return this.metadata.textConfig.textPosition === TextConfig.TEXT_POS_BELOW ? 0 : "unset";
        },
        bottomPx() {
            return this.metadata.textConfig.textPosition === TextConfig.TEXT_POS_ABOVE ? 0 : "unset";
        },
        hintsColor() {
            return fontUtil.getHighContrastColor(
                this.backgroundColor, "#e8e8e8", "#686868"
            );
        },
        elementLevelShown() {
            return !this.gridElement.vocabularyLevel ||
                !this.metadata.vocabularyLevel ||
                this.metadata.vocabularyLevel >= this.gridElement.vocabularyLevel;
        },
        navigationIndicatorStyle() {
            const style = this.metadata.colorConfig.navigationIndicatorStyle;

            const validStyles = [
                ColorConfig.NAV_INDICATOR_STYLE_ICON,
                ColorConfig.NAV_INDICATOR_STYLE_SHADED,
                ColorConfig.NAV_INDICATOR_STYLE_TAB
            ];

            return validStyles.includes(style) ?
                style : ColorConfig.NAV_INDICATOR_STYLE_ICON;
        },
        navigationIndicatorIcon() {
            const icon = this.metadata.colorConfig.navigationIndicatorIcon;
            const validIcons = [
                ColorConfig.NAV_INDICATOR_ICON_STICKY_NOTE,
                ColorConfig.NAV_INDICATOR_ICON_FOLDER,
                ColorConfig.NAV_INDICATOR_ICON_ARROW,
                ColorConfig.NAV_INDICATOR_ICON_SIGN_OUT_ALT,
                ColorConfig.NAV_INDICATOR_ICON_FOLDER_OPEN,
                ColorConfig.NAV_INDICATOR_ICON_TH,
                ColorConfig.NAV_INDICATOR_ICON_TH_LARGE,
                ColorConfig.NAV_INDICATOR_ICON_SQUARE
            ];
            return validIcons.includes(icon) ?
                icon : ColorConfig.NAV_INDICATOR_ICON_STICKY_NOTE;
        },
        navigationIndicatorSize() {
            const value = Number(this.metadata.colorConfig.navigationIndicatorSize);
            if (!Number.isFinite(value)) {
                return ColorConfig.NAV_INDICATOR_SIZE_DEFAULT;
            }
            return Math.max(
                ColorConfig.NAV_INDICATOR_SIZE_MIN,
                Math.min(ColorConfig.NAV_INDICATOR_SIZE_MAX, value)
            );
        },
        isIconIndicator() {
            return this.navigationIndicatorStyle ===
                ColorConfig.NAV_INDICATOR_STYLE_ICON;
        },
        isGeometricIndicator() {
            return !this.isIconIndicator;
        },
        navigationIconClasses() {
            const classes = [
                'fas',
                'fa-' + this.navigationIndicatorIcon
            ];

            if (this.navigationIndicatorIcon ===
                ColorConfig.NAV_INDICATOR_ICON_STICKY_NOTE) {
                classes.push('fa-rotate-180', 'fa-flip-vertical');
            }

            return classes;
        },
        navigationOpacity() {
            const rawOpacity = Number(
                this.metadata.colorConfig.navigationIndicatorOpacity
            );

            return Number.isFinite(rawOpacity) ?
                Math.max(0, Math.min(100, rawOpacity)) :
                ColorConfig.NAV_INDICATOR_OPACITY_DEFAULT;
        },
        navigationIconStyle() {
            const size = this.cornerSizePx;

            // Keep the background square at full size, but make
            // the icon glyph smaller to create internal spacing.
            const iconSize = size * 0.8;

            const backgroundHex = typeof this.backgroundColor === 'string' &&
                /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(this.backgroundColor) ?
                this.backgroundColor : '#ffffff';

            // Normalize abbreviated hexadecimal colors.
            const normalizedBackground = backgroundHex.length === 4 ?
                '#' + backgroundHex.slice(1).split('')
                    .map(value => value + value).join('') :
                backgroundHex;

            // Make a single contrast decision based on the cell background.
            const fillColor = fontUtil.getHighContrastColor(
                normalizedBackground,
                '#000000',
                '#ffffff'
            );

            const iconColor = fillColor === '#ffffff' ?
                '#000000' : '#ffffff';

            const rgb = fillColor === '#ffffff' ?
                '255, 255, 255' : '0, 0, 0';

            return {
                fontSize: iconSize + 'px',
                lineHeight: 1,
                display: 'inline-flex',
                width: size + 'px',
                height: size + 'px',
                alignItems: 'center',
                justifyContent: 'center',
                verticalAlign: 'top',
                backgroundColor: `rgba(${rgb}, ${this.navigationOpacity / 100})`,
                color: iconColor
            };
        },
        cornerSizePx() {
            const width = Math.max(
                0, Number(this.containerSize && this.containerSize.width) || 0
            );
            const height = Math.max(
                0, Number(this.containerSize && this.containerSize.height) || 0
            );

            return Math.min(width, height) *
                this.navigationIndicatorSize / 100;
        },
        indicatorAtBottom() {
            return this.metadata.textConfig.textPosition ===
                TextConfig.TEXT_POS_ABOVE;
        },
        navigationShapeStyle() {
            const config = this.metadata.colorConfig;

            const width = Math.max(
                0, Number(this.containerSize && this.containerSize.width) || 0
            );
            const height = Math.max(
                0, Number(this.containerSize && this.containerSize.height) || 0
            );

            const size = this.cornerSizePx;

            const isTab = this.navigationIndicatorStyle ===
                ColorConfig.NAV_INDICATOR_STYLE_TAB;

            // Overscan compensates for fractional pixel rounding at the
            // top and right edges. The cell clips the excess.
            const overscan = 2;

            const style = {
                width: (size + overscan) + 'px',
                height: (size + overscan) + 'px',
                backgroundColor: config.navigationIndicatorColor ||
                    ColorConfig.NAV_INDICATOR_COLOR_DEFAULT,
                opacity: this.navigationOpacity / 100
            };

            if (this.indicatorAtBottom) {
                style.top = 'auto';
                style.bottom = '-2px';
            }

            if (isTab) {
                const tabWidth = width * this.navigationIndicatorSize / 100;
                const tabHeight = height * 0.10;

                const shapeWidth = tabWidth + overscan;
                const shapeHeight = tabHeight + overscan;
                const diagonalSize = Math.min(shapeHeight, shapeWidth);

                style.width = shapeWidth + 'px';
                style.height = shapeHeight + 'px';

                style.clipPath = this.indicatorAtBottom ?
                    `polygon(0 100%, 100% 100%, 100% 0, ${diagonalSize}px 0)` :
                    `polygon(0 0, 100% 0, 100% 100%, ${diagonalSize}px 100%)`;
            }

            if (!isTab && this.indicatorAtBottom) {
                style.clipPath =
                    'polygon(0 100%, 100% 0, 100% 100%)';
            }

            return style;
        }
    }
}
</script>

<style scoped>
.grid-element-hints {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;
    z-index: 1;
}

.element-hints-content {
    position: absolute;
    right: 0;
    line-height: 1;
    z-index: 2;
}

.navigation-indicator-shape {
    position: absolute;
    top: -2px;
    right: -2px;
    pointer-events: none;
    z-index: 1;
}

.navigation-indicator-shaded {
    clip-path: polygon(0 0, 100% 0, 100% 100%);
}
</style>