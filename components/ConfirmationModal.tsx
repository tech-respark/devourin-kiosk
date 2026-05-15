import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme } from '../src/styles/theme';
import CustomText from './CustomText';

export interface ConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    subtitle: string;
    cancelText: string;
    confirmText: string;
    iconName?: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    iconBgColor?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    visible,
    onClose,
    onConfirm,
    title,
    subtitle,
    cancelText,
    confirmText,
    iconName = "alert-circle",
    iconColor = theme.colors.error,
    iconBgColor = "#feeeeeff",
}) => {
    if (!visible) return null;

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 999999 }]}>
            <View style={styles.overlay}>
                <View style={[styles.modalContent, { zIndex: 1000000 }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={[styles.warningBadge, { backgroundColor: iconBgColor }]}>
                            <Ionicons name={iconName} size={32} color={iconColor} />
                        </View>
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} style={styles.title}>
                            {title}
                        </CustomText>
                        <CustomText fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.regular} color="#666" style={styles.subtitle}>
                            {subtitle}
                        </CustomText>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.btnRow}>
                        <TouchableOpacity style={styles.keepBtn} onPress={onClose} activeOpacity={0.7}>
                            <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} color={theme.colors.grayDark}>
                                {cancelText}
                            </CustomText>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onConfirm} activeOpacity={0.8} style={styles.confirmBtnWrapper}>
                            <LinearGradient colors={['#DD7E33', '#D95C20']} style={styles.confirmBtn}>
                                <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.medium} color="#fff">
                                    {confirmText}
                                </CustomText>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        width: '90%',
        maxWidth: 450,
        backgroundColor: '#fff',
        borderRadius: 35,
        padding: theme.spacing.xl,
        shadowColor: "#000",
        ...(Platform.OS === 'web' ? {
            boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.2)'
        } : {
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.2,
            shadowRadius: 40,
        }),
        elevation: 15,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    warningBadge: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        color: '#162640',
        marginBottom: 10,
    },
    subtitle: {
        textAlign: 'center',
        lineHeight: 22,
    },
    btnRow: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    keepBtn: {
        flex: 1,
        height: 65,
        backgroundColor: '#F5F5F5',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmBtnWrapper: {
        flex: 1,
    },
    confirmBtn: {
        height: 65,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
