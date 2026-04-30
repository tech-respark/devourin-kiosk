import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useAppSelector } from '../src/store/hooks';
import { selectMobileSettings } from '../src/store/userSlice';
import { theme } from '../src/styles/theme';
import CustomText from './CustomText';

interface UpiModalProps {
    visible: boolean;
    onClose: () => void;
    payableAmount: number;
    qrImageUrl?: string;
    remainingSeconds: number;
}

const formatTimer = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds);
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = safeSeconds % 60;
    return `${minutes}:${remainder.toString().padStart(2, '0')}`;
};

export const UpiModal: React.FC<UpiModalProps> = ({ visible, onClose, payableAmount, qrImageUrl, remainingSeconds }) => {
    const mobileSettings = useAppSelector(selectMobileSettings);
    const currency = mobileSettings?.['currency_symbol'] || '₹';

    if (!visible) return null;

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 99999 }]}>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeIcon} onPress={onClose} activeOpacity={0.85}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.amountBox}>
                        <CustomText fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.medium} color="#fff">
                            Pay {currency}{payableAmount.toFixed(2)}
                        </CustomText>
                    </View>

                    {qrImageUrl ? (
                        <Image source={{ uri: qrImageUrl }} style={styles.qrImage} resizeMode="contain" />
                    ) : (
                        <View style={styles.qrFallback}>
                            <ActivityIndicator color="#fff" />
                        </View>
                    )}

                    <View style={styles.statusRow}>
                        <ActivityIndicator color="#fff" />
                        <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} color="#fff">
                            Checking UPI payment status...
                        </CustomText>
                    </View>

                    <CustomText fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.small} color="#fff" style={styles.timerText}>
                        Payment will be cancelled automatically after {formatTimer(remainingSeconds)} minutes
                    </CustomText>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.72)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    modalContent: {
        width: '100%',
        maxWidth: 680,
        alignItems: 'center',
        position: 'relative',
    },
    closeIcon: {
        position: 'absolute',
        top: -58,
        right: 0,
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    amountBox: {
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    qrImage: {
        width: 800,
        height: 800,
        maxWidth: '100%',
        maxHeight: '100%',
    },
    qrFallback: {
        width: 800,
        height: 800,
        maxWidth: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.lg,
    },
    timerText: {
        marginTop: theme.spacing.md,
        textAlign: 'center',
    },
});
