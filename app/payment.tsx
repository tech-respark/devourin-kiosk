import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CustomText from '../components/CustomText';
import { UpiModal } from '../components/UpiModal';
import { clearCart, selectCartSubtotal } from '../src/store/cartSlice';
import { theme } from '../src/styles/theme';

const PAYMENT_METHODS = [
    { id: 'upi', name: 'UPI / QR', icon: '📱' },
    { id: 'card', name: 'Credit / Debit', icon: '💳' },
    { id: 'cash', name: 'Cash Counter', icon: '💵' },
];

export default function PaymentSelection() {
    const router = useRouter();
    const dispatch = useDispatch();
    const totalPayable = useSelector(selectCartSubtotal);
    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [showUpiModal, setShowUpiModal] = useState(false);

    const handlePay = () => {
        if (selectedMethod === 'upi') {
            setShowUpiModal(true);
        } else {
            // Mocking payment success
            dispatch(clearCart());
            router.push('/menu');
        }
    };

    const handleUpiClose = () => {
        setShowUpiModal(false);
        dispatch(clearCart());
        router.push('/menu');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtnWrapper}>
                    <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.regular} color={theme.colors.grayDark}>
                        {'< Back to Cart'}
                    </CustomText>
                </TouchableOpacity>
                <View style={styles.logoWrapper}>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} style={styles.logoText}>
                        DEVOURIN POS
                    </CustomText>
                </View>
                <View style={styles.headerRightPlaceholder} />
            </View>

            {/* Main Content Centered */}
            <View style={styles.mainContent}>
                <View style={styles.paymentCardWrapper}>
                    
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.xsmall} color={theme.colors.grayDark} style={styles.totalPayableLabel}>
                        TOTAL PAYABLE AMOUNT
                    </CustomText>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXXXX} color={theme.colors.default} style={styles.totalPayableValue}>
                        ₹{totalPayable.toFixed(1)}
                    </CustomText>

                    <View style={styles.divider} />

                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} color={theme.colors.text} style={styles.selectMethodTitle}>
                        Select Payment Method
                    </CustomText>

                    {/* Payment Options Row */}
                    <View style={styles.methodsRow}>
                        {PAYMENT_METHODS.map(method => {
                            const isSelected = selectedMethod === method.id;
                            return (
                                <TouchableOpacity 
                                    key={method.id}
                                    style={[styles.methodCard, isSelected && styles.methodCardSelected]}
                                    onPress={() => setSelectedMethod(method.id)}
                                >
                                    <View style={[styles.iconWrapper, isSelected && styles.iconWrapperSelected]}>
                                        <CustomText style={styles.methodIcon}>{method.icon}</CustomText>
                                    </View>
                                    <CustomText 
                                        fontFamily={isSelected ? theme.fonts.Bold : theme.fonts.SemiBold} 
                                        fontSize={theme.fontSize.small} 
                                        color={isSelected ? theme.colors.default : theme.colors.grayDark}
                                    >
                                        {method.name}
                                    </CustomText>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Bottom Action */}
                    <TouchableOpacity onPress={handlePay} style={styles.payButton}>
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color={theme.colors.white}>
                            Pay ₹{totalPayable.toFixed(1)} Securely
                        </CustomText>
                    </TouchableOpacity>

                    <UpiModal 
                        visible={showUpiModal}
                        onClose={handleUpiClose}
                        payableAmount={totalPayable}
                        qrString={`upi://pay?pa=test@upi&am=${totalPayable}`}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        zIndex: 10,
    },
    backBtnWrapper: {
        flex: 1,
    },
    logoWrapper: {
        flex: 1,
        alignItems: 'center',
    },
    logoText: {
        color: theme.colors.text,
        letterSpacing: 2,
    },
    headerRightPlaceholder: {
        flex: 1,
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    paymentCardWrapper: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.border.xxxl,
        padding: theme.spacing.xxl,
        width: '100%',
        maxWidth: 600,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 8,
    },
    totalPayableLabel: {
        letterSpacing: 1.5,
        marginBottom: theme.spacing.sm,
    },
    totalPayableValue: {
        marginBottom: theme.spacing.lg,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: '#F0F0F0',
        marginBottom: theme.spacing.lg,
    },
    selectMethodTitle: {
        marginBottom: theme.spacing.lg,
    },
    methodsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: theme.spacing.xxl,
        gap: theme.spacing.md,
    },
    methodCard: {
        flex: 1,
        backgroundColor: theme.colors.white,
        borderWidth: 2,
        borderColor: '#F0F0F0',
        borderRadius: theme.border.lg,
        paddingVertical: theme.spacing.xl,
        alignItems: 'center',
    },
    methodCardSelected: {
        borderColor: theme.colors.default,
        backgroundColor: '#FCF1E4',
    },
    iconWrapper: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F3F6FB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    iconWrapperSelected: {
        backgroundColor: theme.colors.white,
    },
    methodIcon: {
        fontSize: 32,
    },
    payButton: {
        width: '100%',
        backgroundColor: theme.colors.default,
        paddingVertical: theme.spacing.lg,
        borderRadius: theme.border.md,
        alignItems: 'center',
    }
});
