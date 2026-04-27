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
}

export const UpiModal: React.FC<UpiModalProps> = ({ visible, onClose, payableAmount, qrString }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    {/* Close Button Row */}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <CustomText style={styles.closeBtnText}>✕</CustomText>
                    </TouchableOpacity>

                    {/* Header */}
                    <View style={styles.header}>
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXXX} style={styles.upiLogoText}>UPI</CustomText>
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.xsmall} color={theme.colors.grayDark} style={styles.upiSubText}>
                            UNIFIED PAYMENTS INTERFACE
                        </CustomText>
                    </View>

                    {/* Amount */}
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.small} color={theme.colors.grayDark} style={styles.amountLabel}>
                        Total Payable Amount
                    </CustomText>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXXX} color={theme.colors.default} style={styles.amountValue}>
                        ₹{payableAmount.toFixed(1)}
                    </CustomText>

                    {/* Instruction */}
                    <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} color={theme.colors.text} style={styles.instructionText}>
                        Scan to make payment and finish order
                    </CustomText>

                    {/* QR Code */}
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={qrString || "dummy-qr-data"}
                            size={200}
                            color="black"
                            backgroundColor="white"
                        />
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity activeOpacity={0.7} style={styles.statusBtn}>
                        <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} color={theme.colors.text}>
                            Check Payment Status
                        </CustomText>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
    },
    modalContent: {
        width: '100%',
        maxWidth: 450,
        backgroundColor: theme.colors.white,
        borderRadius: theme.border.xxxl,
        padding: theme.spacing.xl,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    closeBtn: {
        position: 'absolute',
        top: theme.spacing.lg,
        right: theme.spacing.lg,
        padding: theme.spacing.xs,
    },
    closeBtnText: {
        fontSize: 22,
        color: theme.colors.grayDark,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    upiLogoText: {
        fontStyle: 'italic',
        color: '#005a9c', // Standard UPI blue tone
        letterSpacing: 2,
    },
    upiSubText: {
        marginTop: theme.spacing.xs,
        letterSpacing: 1,
    },
    amountLabel: {
        marginBottom: theme.spacing.xs,
    },
    amountValue: {
        marginBottom: theme.spacing.lg,
    },
    instructionText: {
        marginBottom: theme.spacing.lg,
        textAlign: 'center',
    },
    qrContainer: {
        padding: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderRadius: theme.border.lg,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        marginBottom: theme.spacing.xl,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    statusBtn: {
        borderWidth: 1.5,
        borderColor: theme.colors.lightGray1,
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.border.md,
        width: '100%',
        alignItems: 'center',
    }
});
