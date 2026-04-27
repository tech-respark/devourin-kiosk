import { Dimensions } from "react-native";
import { Colors } from "./Colors";
import { FONTS } from "./Fonts";

const { width, height } = Dimensions.get('window');

export const FontSize = {
    xsmall: 10,
    small: 12,
    regular: 14,
    medium: 16,
    large: 18,
    heading: 20,
    headingX: 24,
    headingXX: 28,
    headingXXX: 32,
    headingXXXX: 40,
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
    xxxl: 48,
};

export const theme = {
    colors: Colors,
    fonts: FONTS,
    fontSize: FontSize,
    spacing: Spacing,
    device: {
        width,
        height,
        isTablet: width >= 600,
    },
    border: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        xxl: 32,
        xxxl: 48,
        full: 999,
    }
};

export type Theme = typeof theme;
