<template>
    <div class="grid-element-hints">
        <div v-if="hasNavigation && navigationIndicatorEnabled"
             class="navigation-indicator-shape"
             :class="'navigation-indicator-' + navigationIndicatorShape"
             :style="navigationShapeStyle"
             aria-hidden="true"></div>

        <i v-if="hasNavigation && navigationIndicatorEnabled && navigationIndicatorIcon !== ColorConfig.NAV_INDICATOR_ICON_NONE"
           :class="navigationIconClasses"
           :style="navigationIconStyle"
           aria-hidden="true"></i>

        <div class="element-hints-content"
             :style="`color: ${hintsColor}; top: ${topPx}; bottom: ${bottomPx}`">

            <i v-if="gridElement.hidden"
               class="fas fa-eye-slash element-hint"></i>

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
    props: ["gridElement", "metadata", "backgroundColor", "containerSize", "borderColor", "borderWidthPx"],
    data() {
        return {
            isOnEdit: Router.isOnEditPage()
        };
    },
    computed: {
        ColorConfig() {
            return ColorConfig;
        },
        hasNavigation() {
            return !!this.gridElement.actions.find(
                (action) => action.modelName === GridActionNavigate.getModelName()
            );
        },
        topPx() {
            return this.metadata.textConfig.textPosition === TextConfig.TEXT_POS_BELOW ? 0 : "unset";
        },
        bottomPx() {
            return this.metadata.textConfig.textPosition === TextConfig.TEXT_POS_ABOVE ? 0 : "unset";
        },
        hintsColor() {
            return fontUtil.getHighContrastColor(this.backgroundColor, "#e8e8e8", "#686868");
        },
        elementLevelShown() {
            return !this.gridElement.vocabularyLevel ||
                !this.metadata.vocabularyLevel ||
                this.metadata.vocabularyLevel >= this.gridElement.vocabularyLevel;
        },
        legacyNavigationStyle() {
            const style = this.metadata.colorConfig.navigationIndicatorStyle;
            const validStyles = [
                ColorConfig.NAV_INDICATOR_STYLE_NONE,
                ColorConfig.NAV_INDICATOR_STYLE_ICON,
                ColorConfig.NAV_INDICATOR_STYLE_SHADED,
                ColorConfig.NAV_INDICATOR_STYLE_TAB
            ];
            return validStyles.includes(style) ? style : ColorConfig.NAV_INDICATOR_STYLE_ICON;
        },
        navigationIndicatorEnabled() {
            const configured = this.metadata.colorConfig.navigationIndicatorEnabled;
            return configured === undefined ?
                this.legacyNavigationStyle !== ColorConfig.NAV_INDICATOR_STYLE_NONE :
                configured !== false;
        },
        navigationIndicatorShape() {
            const shape = this.metadata.colorConfig.navigationIndicatorShape;
            const validShapes = [
                ColorConfig.NAV_INDICATOR_SHAPE_SQUARE,
                ColorConfig.NAV_INDICATOR_SHAPE_CORNER,
                ColorConfig.NAV_INDICATOR_SHAPE_TAB,
                ColorConfig.NAV_INDICATOR_SHAPE_WIDE_TAB,
                ColorConfig.NAV_INDICATOR_SHAPE_CIRCLE
            ];
            if (validShapes.includes(shape)) {
                return shape;
            }
            const legacyShapes = {
                [ColorConfig.NAV_INDICATOR_STYLE_ICON]: ColorConfig.NAV_INDICATOR_SHAPE_SQUARE,
                [ColorConfig.NAV_INDICATOR_STYLE_SHADED]: ColorConfig.NAV_INDICATOR_SHAPE_CORNER,
                [ColorConfig.NAV_INDICATOR_STYLE_TAB]: ColorConfig.NAV_INDICATOR_SHAPE_TAB,
                [ColorConfig.NAV_INDICATOR_STYLE_NONE]: ColorConfig.NAV_INDICATOR_SHAPE_SQUARE
            };
            return legacyShapes[this.legacyNavigationStyle] || ColorConfig.NAV_INDICATOR_SHAPE_SQUARE;
        },
        navigationIndicatorAutoColor() {
            return this.metadata.colorConfig.navigationIndicatorAutoColor !== false;
        },
        navigationFillColor() {
            if (this.navigationIndicatorAutoColor) {
                const background = this.normalizeHexColor(this.backgroundColor) || '#ffffff';
                return fontUtil.getHighContrastColor(background, '#ffffff', '#000000');
            }
            return this.normalizeHexColor(this.metadata.colorConfig.navigationIndicatorColor) ||
                ColorConfig.NAV_INDICATOR_COLOR_DEFAULT;
        },
        navigationIndicatorIcon() {
            const config = this.metadata.colorConfig;
            // The narrow tab intentionally has no icon; keep the configured icon untouched.
            if (this.navigationIndicatorShape === ColorConfig.NAV_INDICATOR_SHAPE_TAB) {
                return ColorConfig.NAV_INDICATOR_ICON_NONE;
            }
            if (config.navigationIndicatorEnabled === undefined &&
                config.navigationIndicatorShape === undefined &&
                (this.legacyNavigationStyle === ColorConfig.NAV_INDICATOR_STYLE_SHADED ||
                 this.legacyNavigationStyle === ColorConfig.NAV_INDICATOR_STYLE_TAB)) {
                return ColorConfig.NAV_INDICATOR_ICON_NONE;
            }
            const icon = config.navigationIndicatorIcon;
            if (icon === ColorConfig.NAV_INDICATOR_ICON_NONE) {
                return ColorConfig.NAV_INDICATOR_ICON_NONE;
            }
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
            return validIcons.includes(icon) ? icon : ColorConfig.NAV_INDICATOR_ICON_STICKY_NOTE;
        },
        navigationIndicatorSize() {
            const value = Number(this.metadata.colorConfig.navigationIndicatorSize);
            if (!Number.isFinite(value)) {
                return ColorConfig.NAV_INDICATOR_SIZE_DEFAULT;
            }
            return Math.max(ColorConfig.NAV_INDICATOR_SIZE_MIN,
                Math.min(ColorConfig.NAV_INDICATOR_SIZE_MAX, value));
        },
        navigationOpacity() {
            const rawOpacity = Number(this.metadata.colorConfig.navigationIndicatorOpacity);
            return Number.isFinite(rawOpacity) ?
                Math.max(0, Math.min(100, rawOpacity)) :
                ColorConfig.NAV_INDICATOR_OPACITY_DEFAULT;
        },
        indicatorAtBottom() {
            return this.metadata.textConfig.textPosition === TextConfig.TEXT_POS_ABOVE;
        },
        navigationShapeWidthPx() {
            const width = Math.max(0, Number(this.containerSize && this.containerSize.width) || 0);
            return this.navigationIndicatorShape === ColorConfig.NAV_INDICATOR_SHAPE_TAB ?
                width * this.navigationIndicatorSize / 100 : this.cornerSizePx;
        },
        navigationShapeHeightPx() {
            const height = Math.max(0, Number(this.containerSize && this.containerSize.height) || 0);
            if (this.navigationIndicatorShape === ColorConfig.NAV_INDICATOR_SHAPE_TAB) {
                return height * 0.10;
            }
            return this.navigationIndicatorShape === ColorConfig.NAV_INDICATOR_SHAPE_WIDE_TAB ?
                this.cornerSizePx / 2 : this.cornerSizePx;
        },
        cornerSizePx() {
            const width = Math.max(0, Number(this.containerSize && this.containerSize.width) || 0);
            const height = Math.max(0, Number(this.containerSize && this.containerSize.height) || 0);
            return Math.min(width, height) * this.navigationIndicatorSize / 100;
        },
        navigationShapeStyle() {
            const width = this.navigationShapeWidthPx;
            const height = this.navigationShapeHeightPx;
            const fillRgb = this.hexToRgb(this.navigationFillColor);
            const style = {
                width: width + 'px',
                height: height + 'px',
                backgroundColor: 'rgba(' + fillRgb.join(', ') + ', ' + (this.navigationOpacity / 100) + ')',
                top: this.indicatorAtBottom ? 'auto' : '0',
                bottom: this.indicatorAtBottom ? '0' : 'auto'
            };

            if (this.navigationIndicatorShape === ColorConfig.NAV_INDICATOR_SHAPE_CORNER) {
                style.clipPath = this.indicatorAtBottom ?
                    'polygon(0 100%, 100% 0, 100% 100%)' :
                    'polygon(0 0, 100% 0, 100% 100%)';
            } else if (this.navigationIndicatorShape === ColorConfig.NAV_INDICATOR_SHAPE_TAB) {
                const diagonalSize = Math.min(height, width);
                style.clipPath = this.indicatorAtBottom ?
                    `polygon(0 100%, 100% 100%, 100% 0, ${diagonalSize}px 0)` :
                    `polygon(0 0, 100% 0, 100% 100%, ${diagonalSize}px 100%)`;
            } else if (this.navigationIndicatorShape === ColorConfig.NAV_INDICATOR_SHAPE_WIDE_TAB) {
                style.clipPath = this.indicatorAtBottom ?
                    'polygon(0 100%, 100% 100%, 100% 0, 50% 0)' :
                    'polygon(0 0, 100% 0, 100% 100%, 50% 100%)';
            } else if (this.navigationIndicatorShape === ColorConfig.NAV_INDICATOR_SHAPE_CIRCLE) {
                // A circle clipped to the cell corner leaves a single inward-facing arc.
                style.clipPath = this.indicatorAtBottom ?
                    `circle(${width}px at ${width}px ${height}px)` :
                    `circle(${width}px at ${width}px 0px)`;
            }

            return style;
        },
        navigationIconClasses() {
            const classes = ['fas', 'fa-' + this.navigationIndicatorIcon];
            if (this.navigationIndicatorIcon === ColorConfig.NAV_INDICATOR_ICON_STICKY_NOTE) {
                classes.push('fa-rotate-180', 'fa-flip-vertical');
            }
            return classes;
        },
        navigationIconStyle() {
            // Measure the icon directly against the indicator's actual fill geometry.
            const shapeWidth = this.navigationShapeWidthPx;
            const shapeHeight = this.navigationShapeHeightPx;
            const center = this.navigationIconCenter(shapeWidth, shapeHeight);
            const iconSize = Math.min(shapeWidth, shapeHeight) *
                (this.navigationIndicatorShape === ColorConfig.NAV_INDICATOR_SHAPE_TAB ? 0.68 :
                    this.navigationIndicatorShape === ColorConfig.NAV_INDICATOR_SHAPE_CORNER ? 0.30 :
                    this.navigationIndicatorShape === ColorConfig.NAV_INDICATOR_SHAPE_WIDE_TAB ? 0.36 :
                    this.navigationIndicatorShape === ColorConfig.NAV_INDICATOR_SHAPE_CIRCLE ? 0.40 : 0.48);

            const iconAutoColor = this.metadata.colorConfig.navigationIndicatorIconAutoColor !== false;
            let iconColor = this.normalizeHexColor(this.metadata.colorConfig.navigationIndicatorIconColor) ||
                ColorConfig.NAV_INDICATOR_ICON_COLOR_DEFAULT;

            if (iconAutoColor) {
                const fillRgb = this.hexToRgb(this.navigationFillColor);
                const background = this.normalizeHexColor(this.backgroundColor) || '#ffffff';
                const backgroundRgb = this.hexToRgb(background);
                const opacity = this.navigationOpacity / 100;
                const visibleRgb = fillRgb.map((value, index) =>
                    Math.round(value * opacity + backgroundRgb[index] * (1 - opacity))
                );
                const visibleHex = '#' + visibleRgb.map(value => value.toString(16).padStart(2, '0')).join('');
                iconColor = fontUtil.getHighContrastColor(visibleHex, '#ffffff', '#000000');
            }

            const style = {
                position: 'absolute',
                width: iconSize + 'px',
                height: iconSize + 'px',
                fontSize: iconSize + 'px',
                lineHeight: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: iconColor,
                pointerEvents: 'none',
                zIndex: 2,
                right: (shapeWidth - center.x - iconSize / 2) + 'px'
            };

            if (this.indicatorAtBottom) {
                style.top = 'auto';
                style.bottom = (shapeHeight - center.y - iconSize / 2) + 'px';
            } else {
                style.top = (center.y - iconSize / 2) + 'px';
                style.bottom = 'auto';
            }

            return style;
        }
    },
    methods: {
        navigationIconCenter(width, height) {
            switch (this.navigationIndicatorShape) {
                case ColorConfig.NAV_INDICATOR_SHAPE_CORNER:
                    return {
                        x: width * 3 / 4,
                        y: height * (this.indicatorAtBottom ? 3 / 4 : 1 / 4)
                    };
                case ColorConfig.NAV_INDICATOR_SHAPE_CIRCLE: {
                    const offset = width * 4 / (3 * Math.PI);
                    return {
                        x: width - offset,
                        y: this.indicatorAtBottom ? height - offset : offset
                    };
                }
                case ColorConfig.NAV_INDICATOR_SHAPE_TAB:
                case ColorConfig.NAV_INDICATOR_SHAPE_WIDE_TAB: {
                    // The tab is a quadrilateral with a diagonal inner corner.
                    // Its area centroid is calculated from the same polygon vertices
                    // used by navigationShapeStyle.
                    const diagonal = Math.min(height, width);
                    let points;
                    if (this.navigationIndicatorShape === ColorConfig.NAV_INDICATOR_SHAPE_WIDE_TAB) {
                        points = this.indicatorAtBottom ?
                            [[0, height], [width, height], [width, 0], [width / 2, 0]] :
                            [[0, 0], [width, 0], [width, height], [width / 2, height]];
                    } else {
                        points = this.indicatorAtBottom ?
                            [[0, height], [width, height], [width, 0], [diagonal, 0]] :
                            [[0, 0], [width, 0], [width, height], [diagonal, height]];
                    }
                    let twiceArea = 0;
                    let centroidX = 0;
                    let centroidY = 0;

                    points.forEach((point, index) => {
                        const next = points[(index + 1) % points.length];
                        const cross = point[0] * next[1] - next[0] * point[1];
                        twiceArea += cross;
                        centroidX += (point[0] + next[0]) * cross;
                        centroidY += (point[1] + next[1]) * cross;
                    });

                    if (twiceArea === 0) {
                        return { x: width / 2, y: height / 2 };
                    }

                    return {
                        x: centroidX / (3 * twiceArea),
                        y: centroidY / (3 * twiceArea)
                    };
                }
                case ColorConfig.NAV_INDICATOR_SHAPE_SQUARE:
                default:
                    return { x: width / 2, y: height / 2 };
            }
        },
        normalizeHexColor(color) {
            if (typeof color !== 'string' || !/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(color)) {
                return null;
            }
            return color.length === 4 ?
                '#' + color.slice(1).split('').map(value => value + value).join('') :
                color.toLowerCase();
        },
        hexToRgb(hex) {
            const normalized = this.normalizeHexColor(hex) || '#ffffff';
            return [
                parseInt(normalized.slice(1, 3), 16),
                parseInt(normalized.slice(3, 5), 16),
                parseInt(normalized.slice(5, 7), 16)
            ];
        }
    }
};
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
    right: 0;
    pointer-events: none;
    z-index: 1;
}
</style>