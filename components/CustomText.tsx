import React, { FC } from "react";
import { Text, TextStyle } from "react-native";
import { theme } from "../src/styles/theme";

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7' | 'h8';

interface Props {
    variant?: Variant;
    fontFamily?: string;
    color?: string;
    style?: TextStyle | TextStyle[];
    children?: React.ReactNode;
    numberOfLines?: number;
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
    onLayout?: (event: any) => void;
    onPress?: () => void;
    fontSize?: number;
    disabled?: boolean;
}

const CustomText: FC<Props> = ({ 
    variant, 
    fontFamily, 
    color, 
    style, 
    children, 
    numberOfLines, 
    onLayout, 
    onPress, 
    disabled, 
    fontSize, 
    ...props 
}) => {
    return (
        <Text 
            {...props} 
            disabled={disabled} 
            numberOfLines={numberOfLines} 
            onLayout={onLayout} 
            onPress={onPress} 
            style={[
                { 
                    color: color || theme.colors.text, 
                    fontFamily: fontFamily || theme.fonts.Regular, 
                    fontSize: fontSize || theme.fontSize.regular, 
                    includeFontPadding: false 
                }, 
                style
            ]}
        >
            {children}
        </Text>
    );
};

export default CustomText;
