import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../src/styles/theme';
import CustomText from './CustomText';

interface UpiModalProps {
    visible: boolean;
    onClose: () => void;
    payableAmount: number;
    qrString: string;
    onPaymentConfirm?: () => void;
}

export const UpiModal: React.FC<UpiModalProps> = ({ visible, onClose, payableAmount, qrString, onPaymentConfirm }) => {
    if (!visible) return null;

    return (
        <View style={[StyleSheet.absoluteFill, { zIndex: 99999 }]}>
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    {/* Status Header */}
                    <View style={styles.statusHeader}>
                        <Ionicons name="time-outline" size={20} color="#666" />
                        <CustomText fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.small} color="#666">
                            Waiting for payment...
                        </CustomText>
                        <TouchableOpacity style={styles.closeIcon} onPress={onClose}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    {/* QR Branding & Amount */}
                    <View style={styles.brandingContainer}>
                        <View style={styles.upiRow}>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} style={styles.upiText}>UPI</CustomText>
                            <View style={styles.dividerDot} />
                            <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.small} color="#005A9C">BHIM</CustomText>
                        </View>
                        
                        <View style={styles.amountBox}>
                            <CustomText fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.small} color="#666">
                                Total Amount
                            </CustomText>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXXX} color="#162640">
                                ₹{payableAmount.toFixed(1)}
                            </CustomText>
                        </View>
                    </View>

                    {/* QR Code Container */}
                    <View style={styles.qrOuterWrapper}>
                        <View style={styles.qrInner}>
                            <QRCode
                                value={qrString || "skip-logic"}
                                size={220}
                                color="#000"
                                backgroundColor="#FFF"
                                quietZone={10}
                            />
                        </View>
                        <View style={styles.qrFooter}>
                            <Ionicons name="scan-outline" size={20} color="#D13C25" />
                            <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.small} color="#D13C25">
                                Scan QR code with any UPI App
                            </CustomText>
                        </View>
                    </View>

                    {/* Status Button / Footer */}
                    <TouchableOpacity activeOpacity={0.8} style={styles.checkStatusBtn} onPress={onPaymentConfirm ?? onClose}>
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.medium} color="#fff">
                            Payment Done
                        </CustomText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onClose} style={styles.cancelLink}>
                        <CustomText fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.small} color="#999">
                            Cancel Transaction
                        </CustomText>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        width: '100%',
        maxWidth: 500,
        backgroundColor: '#fff',
        borderRadius: 35,
        padding: theme.spacing.xl,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.2,
        shadowRadius: 40,
        elevation: 15,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: 10,
        marginBottom: theme.spacing.xl,
        position: 'relative',
    },
    closeIcon: {
        position: 'absolute',
        right: 0,
        padding: 5,
    },
    brandingContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    upiRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    upiText: {
        fontStyle: 'italic',
        letterSpacing: 1.5,
        color: '#005A9C',
    },
    dividerDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CCC',
        marginHorizontal: 10,
    },
    amountBox: {
        alignItems: 'center',
    },
    qrOuterWrapper: {
        backgroundColor: '#F8F9FB',
        borderRadius: 30,
        padding: theme.spacing.xl,
        alignItems: 'center',
        width: '100%',
        marginBottom: theme.spacing.xl,
    },
    qrInner: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    qrFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        gap: 8,
    },
    checkStatusBtn: {
        width: '100%',
        height: 65,
        backgroundColor: '#D13C25',
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    cancelLink: {
        padding: theme.spacing.xs,
    }
});
