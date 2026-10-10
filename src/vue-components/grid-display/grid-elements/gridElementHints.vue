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
                ColorConfig.NAV_INDICATOR_STYLE_FOLDED,
                ColorConfig.NAV_INDICATOR_STYLE_FOLDER
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
                ColorConfig.NAV_INDICATOR_ICON_LINK
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
        navigationIconStyle() {
            return {
                fontSize: this.cornerSizePx + 'px',
                lineHeight: 1
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
        navigationShapeStyle() {
            const config = this.metadata.colorConfig;

            const width = Math.max(
                0, Number(this.containerSize && this.containerSize.width) || 0
            );
            const height = Math.max(
                0, Number(this.containerSize && this.containerSize.height) || 0
            );

            const size = this.cornerSizePx;

            const rawOpacity = Number(config.navigationIndicatorOpacity);
            const opacity = Number.isFinite(rawOpacity) ?
                Math.max(0, Math.min(100, rawOpacity)) :
                ColorConfig.NAV_INDICATOR_OPACITY_DEFAULT;

            const isFolder = this.navigationIndicatorStyle ===
                ColorConfig.NAV_INDICATOR_STYLE_FOLDER;

            const style = {
                width: size + 'px',
                height: size + 'px',
                backgroundColor: config.navigationIndicatorColor ||
                    ColorConfig.NAV_INDICATOR_COLOR_DEFAULT,
                opacity: opacity / 100
            };

            if (isFolder) {
                const folderWidth = width * this.navigationIndicatorSize / 100;
                const folderHeight = height * 0.10;

                // Keep the diagonal at 45 degrees and within the shape.
                const diagonalSize = Math.min(folderHeight, folderWidth);

                style.width = folderWidth + 'px';
                style.height = folderHeight + 'px';

                style.clipPath =
                    `polygon(0 0, 100% 0, 100% 100%, ${diagonalSize}px 100%)`;
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
    top: 0;
    right: 0;
    pointer-events: none;
    z-index: 1;
}

.navigation-indicator-shaded,
.navigation-indicator-folded {
    clip-path: polygon(0 0, 100% 0, 100% 100%);
}

.navigation-indicator-folded::after {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(255, 255, 255, 0.55);
    clip-path: polygon(12% 0, 100% 0, 100% 88%);
}
</style>