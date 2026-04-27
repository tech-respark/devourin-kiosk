import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme } from '../src/styles/theme';
import CustomText from './CustomText';

interface AdminModalProps {
    visible: boolean;
    onClose: () => void;
    onResync: () => void;
    onLogout: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ visible, onClose, onResync, onLogout }) => {
    if (!visible) return null;

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 99999 }]}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={[styles.modalContent, { zIndex: 100000 }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.adminBadge}>
                            <Ionicons name="shield-checkmark" size={24} color={theme.colors.theme} />
                        </View>
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} style={styles.title}>
                            Terminal Settings
                        </CustomText>
                        <CustomText fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.small} color="#666" style={styles.subtitle}>
                            Manage your kiosk terminal configuration
                        </CustomText>
                    </View>

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        <TouchableOpacity style={styles.optionItem} onPress={onResync} activeOpacity={0.7}>
                            <View style={[styles.iconBox, { backgroundColor: theme.colors.theme_light }]}>
                                <Ionicons name="sync" size={24} color={theme.colors.theme} />
                            </View>
                            <View style={styles.optionTextContent}>
                                <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} color="#162640">
                                    Resync Data
                                </CustomText>
                                <CustomText fontSize={theme.fontSize.xsmall} color="#666">
                                    Refresh menu and categories
                                </CustomText>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#CCC" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.optionItem} onPress={onLogout} activeOpacity={0.7}>
                            <View style={[styles.iconBox, { backgroundColor: '#FFF0F0' }]}>
                                <Ionicons name="log-out-outline" size={24} color="#D13C25" />
                            </View>
                            <View style={styles.optionTextContent}>
                                <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} color="#D13C25">
                                    Logout & Reset
                                </CustomText>
                                <CustomText fontSize={theme.fontSize.xsmall} color="#666">
                                    Clear all device configurations
                                </CustomText>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#CCC" />
                        </TouchableOpacity>
                    </View>

                    {/* Footer / Cancel */}
                    <TouchableOpacity onPress={onClose} activeOpacity={0.8}>
                        <LinearGradient colors={['#DD7E33', '#D95C20']} style={styles.cancelBtn}>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.medium} color="#fff">
                                Back To Mode Selection
                            </CustomText>
                        </LinearGradient>

                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    adminBadge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.theme_light2,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    title: {
        color: '#162640',
        marginBottom: 5,
    },
    subtitle: {
        textAlign: 'center',
    },
    optionsContainer: {
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xxl,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.light_gray,
    },
    iconBox: {
        width: 50,
        height: 50,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    optionTextContent: {
        flex: 1,
    },
    cancelBtn: {
        width: '100%',
        height: 65,
        backgroundColor: theme.colors.theme,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
