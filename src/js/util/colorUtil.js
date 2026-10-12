import {constants} from "./constants";
import {MetaData} from "../model/MetaData";
import {GridElement} from "../model/GridElement";
import {ColorConfig} from "../model/ColorConfig";
import {fontUtil} from "./fontUtil";

let colorUtil = {};

colorUtil.getElementColor = function(gridElement = {}, metadata, fallbackColor) {
    metadata = metadata || new MetaData();
    let defaultColor = gridElement.backgroundColor || fallbackColor || metadata.colorConfig.elementBackgroundColor || constants.DEFAULT_ELEMENT_BACKGROUND_COLOR;
    let colorScheme = colorUtil.getUseColorScheme(metadata);
    if (!colorScheme) {
        return defaultColor;
    }
    let index = colorScheme.categories.indexOf(gridElement.colorCategory);
    if (index === -1 && colorScheme.mappings) {
        let mapped = colorScheme.mappings[gridElement.colorCategory];
        index = colorScheme.categories.indexOf(mapped);
    }
    return index === -1 ? defaultColor : colorScheme.colors[index];
}

colorUtil.getBackgroundColor = function(element = {}, metadata, fallbackColor) {
    if (!metadata || !element) {
        return '';
    }
    if (element.type === GridElement.ELEMENT_TYPE_UI_FILLER) {
        return constants.COLORS.TRANSPARENT;
    }
    if (element.type === GridElement.ELEMENT_TYPE_DYNAMIC_GRID_PLACEHOLDER) {
        return constants.COLORS.TRANSPARENT;
    }
    if (element.type === GridElement.ELEMENT_TYPE_PREDICTION) {
        return constants.COLORS.PREDICT_BACKGROUND;
    }
    if (element.type === GridElement.ELEMENT_TYPE_LIVE) {
        return element.backgroundColor || constants.COLORS.LIVE_BACKGROUND;
    }
    if ([ColorConfig.COLOR_MODE_BACKGROUND, ColorConfig.COLOR_MODE_BOTH].includes(metadata.colorConfig.colorMode)) {
        return colorUtil.getElementColor(element, metadata);
    }
    return metadata.colorConfig.elementBackgroundColor;
}

colorUtil.getBorderColor = function (element = {}, metadata, returnHex) {
    if (!metadata || !metadata.colorConfig) {
        return constants.COLORS.GRAY;
    }

    if (element.type === GridElement.ELEMENT_TYPE_UI_FILLER) {
        return constants.COLORS.TRANSPARENT;
    }

    if (metadata.colorConfig.colorMode === ColorConfig.COLOR_MODE_BOTH && element.borderColor) {
        // element.borderColor only used for color mode "both", see https://github.com/asterics/Asterics-AAC/issues/580#issuecomment-3281187917
        return element.borderColor;
    }

    let color = metadata.colorConfig.elementBorderColor;
    if (metadata.colorConfig.elementBorderColor === constants.DEFAULT_ELEMENT_BORDER_COLOR) {
        let backgroundColor = metadata.colorConfig.gridBackgroundColor || constants.COLORS.WHITE;
        color = fontUtil.getHighContrastColor(backgroundColor, constants.COLORS.WHITESMOKE, constants.COLORS.GRAY);
    }
    if (metadata.colorConfig.colorMode === ColorConfig.COLOR_MODE_BORDER) {
        return colorUtil.getElementColor(element, metadata, color);
    }
    if (metadata.colorConfig.colorMode === ColorConfig.COLOR_MODE_BOTH) {
        if (!element.colorCategory) {
            return 'transparent';
        }
        let colorScheme = colorUtil.getUseColorScheme(metadata);
        if (colorScheme && colorScheme.customBorders && colorScheme.customBorders[element.colorCategory]) {
            return colorScheme.customBorders[element.colorCategory];
        }
        let absAdjustment = 40;
        let bgColor = colorUtil.getElementColor(element, metadata, color);
        let adjustment = fontUtil.isHexDark(bgColor) ? absAdjustment * 1.5 : absAdjustment * -1;
        return fontUtil.adjustHexColor(bgColor, adjustment, returnHex);
    }
    return color;
}

colorUtil.getFontColor = function(metadata, backgroundColor, hasImage = false) {
    if (!metadata || !metadata.textConfig) {
        return constants.COLORS.BLACK;
    }

    const config = metadata.textConfig;

    if (config.fontColorAuto === false) {
        return config.fontColor || constants.COLORS.BLACK;
    }

    const isValidHex = value =>
        /^#[0-9a-f]{6}$/i.test(value || '');

    const cellColor = isValidHex(backgroundColor)
        ? backgroundColor
        : constants.COLORS.WHITE;

    let visibleColor = cellColor;

    if (hasImage && config.textBackgroundEnabled === true) {
        const fillColor = isValidHex(config.textBackgroundColor)
            ? config.textBackgroundColor
            : '#000000';

        const opacityValue = Number(config.textBackgroundOpacity);
        const opacity = Number.isFinite(opacityValue)
            ? Math.max(0, Math.min(100, opacityValue)) / 100
            : 0.5;

        const hexToRgb = hex => [
            parseInt(hex.slice(1, 3), 16),
            parseInt(hex.slice(3, 5), 16),
            parseInt(hex.slice(5, 7), 16)
        ];

        const fillRgb = hexToRgb(fillColor);
        const backgroundRgb = hexToRgb(cellColor);

        const visibleRgb = fillRgb.map((value, index) =>
            Math.round(
                value * opacity +
                backgroundRgb[index] * (1 - opacity)
            )
        );

        visibleColor = '#' + visibleRgb
            .map(value => value.toString(16).padStart(2, '0'))
            .join('');
    }

    return fontUtil.getHighContrastColor(
        visibleColor,
        constants.COLORS.WHITE,
        constants.COLORS.BLACK
    );
},

colorUtil.getUseColorScheme = function (metadata) {
    if (!metadata || !metadata.colorConfig || !metadata.colorConfig.colorSchemesActivated) {
        return null;
    }
    return colorUtil.getActiveColorScheme(metadata);
}

colorUtil.getActiveColorScheme = function (metadata) {
    metadata = metadata || new MetaData();
    return (
        constants.DEFAULT_COLOR_SCHEMES.filter(
            (scheme) => scheme.name === metadata.colorConfig.activeColorScheme
        )[0] || constants.DEFAULT_COLOR_SCHEMES[0]
    );
}

export { colorUtil };
