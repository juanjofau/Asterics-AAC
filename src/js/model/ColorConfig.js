import { Model } from '../externals/objectmodel';
import { constants } from '../util/constants';

class ColorConfig extends Model({
    modelName: String,
    modelVersion: String,
    colorSchemesActivated: [Boolean],
    activeColorScheme: [String],
    additionalColorSchemes: [Array],
    elementBackgroundColor: [String],
    elementBorderColor: [String],
    gridBackgroundColor: [String],
    borderWidth: [Number],
    elementMargin: [Number],
    borderRadius: [Number],
    gradientEnabled: [Boolean],
    gradientWhiteOpacity: [Number],
    gradientBlackOpacity: [Number],
    shadowEnabled: [Boolean],
    shadowOffsetY: [Number],
    shadowBlur: [Number],
    shadowOpacity: [Number],
    colorMode: [String],
    navigationIndicatorStyle: [String],
    navigationIndicatorIcon: [String],
    navigationIndicatorSize: [Number],
    navigationIndicatorColor: [String],
    navigationIndicatorOpacity: [Number],
    navigationIndicatorAutoColor: [Boolean],
    navigationIndicatorShowBorder: [Boolean],
    navigationIndicatorEnabled: [Boolean],
    navigationIndicatorShape: [String],
    navigationIndicatorIconAutoColor: [Boolean],
    navigationIndicatorIconColor: [String]
}) {
    constructor(properties) {
        super(properties);
    }

    static getModelName() {
        return 'ColorConfig';
    }
}

ColorConfig.COLOR_MODE_BACKGROUND = 'COLOR_MODE_BACKGROUND';
ColorConfig.COLOR_MODE_BORDER = 'COLOR_MODE_BORDER';
ColorConfig.COLOR_MODE_BOTH = 'COLOR_MODE_BOTH';

ColorConfig.BORDER_WIDTH_BORDER_COLORED = 0.45;
ColorConfig.BORDER_WIDTH_BG_COLORED = 0.1;

ColorConfig.NAV_INDICATOR_STYLE_ICON = 'icon';
ColorConfig.NAV_INDICATOR_STYLE_SHADED = 'shaded';
ColorConfig.NAV_INDICATOR_STYLE_TAB = 'tab';
ColorConfig.NAV_INDICATOR_STYLE_NONE = 'none';

ColorConfig.NAV_INDICATOR_SHAPE_SQUARE = 'square';
ColorConfig.NAV_INDICATOR_SHAPE_CORNER = 'corner';
ColorConfig.NAV_INDICATOR_SHAPE_TAB = 'tab';
ColorConfig.NAV_INDICATOR_SHAPE_CIRCLE = 'circle';
ColorConfig.NAV_INDICATOR_ICON_NONE = 'none';

ColorConfig.NAV_INDICATOR_ICON_STICKY_NOTE = 'sticky-note';
ColorConfig.NAV_INDICATOR_ICON_FOLDER = 'folder';
ColorConfig.NAV_INDICATOR_ICON_ARROW = 'arrow-right';
ColorConfig.NAV_INDICATOR_ICON_SIGN_OUT_ALT = 'sign-out-alt';
ColorConfig.NAV_INDICATOR_ICON_FOLDER_OPEN = 'folder-open';
ColorConfig.NAV_INDICATOR_ICON_TH = 'th';
ColorConfig.NAV_INDICATOR_ICON_TH_LARGE = 'th-large';
ColorConfig.NAV_INDICATOR_ICON_SQUARE = 'square';
ColorConfig.NAV_INDICATOR_ICON_DOT_CIRCLE = 'dot-circle';
ColorConfig.NAV_INDICATOR_ICON_CIRCLE = 'circle';

ColorConfig.NAV_INDICATOR_SIZE_MIN = 10;
ColorConfig.NAV_INDICATOR_SIZE_MAX = 100;
ColorConfig.NAV_INDICATOR_SIZE_DEFAULT = 30;

ColorConfig.NAV_INDICATOR_COLOR_DEFAULT = '#3478b8';
ColorConfig.NAV_INDICATOR_ICON_COLOR_DEFAULT = '#ffffff';
ColorConfig.NAV_INDICATOR_OPACITY_DEFAULT = 80;

ColorConfig.defaults({
    modelName: ColorConfig.getModelName(),
    modelVersion: constants.MODEL_VERSION,
    colorSchemesActivated: true,
    activeColorScheme: constants.DEFAULT_COLOR_SCHEMES[0].name,
    additionalColorSchemes: [],
    elementBackgroundColor: constants.DEFAULT_ELEMENT_BACKGROUND_COLOR,
    elementBorderColor: constants.DEFAULT_ELEMENT_BORDER_COLOR,
    gridBackgroundColor: constants.DEFAULT_GRID_BACKGROUND_COLOR,
    borderWidth: ColorConfig.BORDER_WIDTH_BG_COLORED,
    elementMargin: 0.15,
    borderRadius: 0.4,
    gradientEnabled: true,
    gradientWhiteOpacity: 20,
    gradientBlackOpacity: 10,
    shadowEnabled: true,
    shadowOffsetY: 10,
    shadowBlur: 10,
    shadowOpacity: 30,
    colorMode: ColorConfig.COLOR_MODE_BACKGROUND,
    navigationIndicatorStyle: ColorConfig.NAV_INDICATOR_STYLE_ICON,
    navigationIndicatorIcon: ColorConfig.NAV_INDICATOR_ICON_STICKY_NOTE,
    navigationIndicatorSize: ColorConfig.NAV_INDICATOR_SIZE_DEFAULT,
    navigationIndicatorColor: ColorConfig.NAV_INDICATOR_COLOR_DEFAULT,
    navigationIndicatorOpacity: ColorConfig.NAV_INDICATOR_OPACITY_DEFAULT,
    navigationIndicatorAutoColor: true,
    navigationIndicatorShowBorder: true,
    navigationIndicatorIconAutoColor: true,
    navigationIndicatorIconColor: ColorConfig.NAV_INDICATOR_ICON_COLOR_DEFAULT
});

export { ColorConfig };
