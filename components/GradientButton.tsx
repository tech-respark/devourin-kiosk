import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../src/styles/theme';
import CustomText from './CustomText';

interface GradientButtonProps {
    title: string;
    onPress: () => void;
    style?: ViewStyle;
    icon?: React.ReactNode;
    fontSize?: number;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
    title,
    onPress,
    style,
    icon,
    fontSize
}) => {
    return (
        <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
            <LinearGradient
                colors={['#DD7E33', '#D95C20']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.button, style]}
            >
                {icon}
                <CustomText 
                    fontFamily={theme.fonts.Bold} 
                    fontSize={fontSize || theme.fontSize.medium} 
                    color={theme.colors.white}
                >
                    {title}
                </CustomText>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.border.md,
        gap: theme.spacing.xs,
    }
});
