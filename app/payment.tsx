import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import CustomText from '../components/CustomText';
import { UpiModal } from '../components/UpiModal';
import { clearCart, selectCartSubtotal } from '../src/store/cartSlice';
import { theme } from '../src/styles/theme';

const PAYMENT_METHODS = [
    { id: 'upi', name: 'UPI / QR', icon: 'tablet-portrait-outline', disabled: false, type: 'ionic' },
    { id: 'card', name: 'Credit / Debit', icon: 'credit-card', disabled: true, type: 'material' },
    { id: 'cash', name: 'Cash Counter', icon: 'payments', disabled: true, type: 'material' },
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
        }
    };

    const handleUpiClose = () => {
        setShowUpiModal(false);
        // Usually, you only clear on SUCCESS, but for this mock, we'll clear it.
        dispatch(clearCart());
        router.replace('/menu');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
                    <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium}>Back To Cart</CustomText>
                </TouchableOpacity>
                <Image
                    source={require('../assets/icons/logo.png')}
                    style={styles.devourinLogo}
                    resizeMode="contain"
                />
                <View style={{ width: 100 }} />
            </View>

            {/* Main Content Centered */}
            <View style={styles.mainContent}>
                <View style={styles.paymentCard}>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} style={styles.totalLabel}>
                        Total Payable Amount
                    </CustomText>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXXXX} color="#D13C25" style={styles.totalValue}>
                        ₹{totalPayable.toFixed(1)}
                    </CustomText>

                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} style={styles.selectTitle}>
                        Select Payment Method
                    </CustomText>

                    {/* Payment Options Row */}
                    <View style={styles.methodsRow}>
                        {PAYMENT_METHODS.map(method => {
                            const isSelected = selectedMethod === method.id;
                            const isDisabled = method.disabled;

                            return (
                                <TouchableOpacity
                                    key={method.id}
                                    disabled={isDisabled}
                                    style={[
                                        styles.methodCard,
                                        isSelected && styles.methodCardSelected,
                                        isDisabled && styles.methodCardDisabled
                                    ]}
                                    onPress={() => setSelectedMethod(method.id)}
                                >
                                    <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                                        {method.type === 'ionic' ? (
                                            <Ionicons name={method.icon as any} size={32} color={isDisabled ? '#CCC' : '#333'} />
                                        ) : (
                                            <MaterialIcons name={method.icon as any} size={32} color={isDisabled ? '#CCC' : '#333'} />
                                        )}
                                    </View>
                                    <CustomText
                                        fontFamily={theme.fonts.Medium}
                                        fontSize={theme.fontSize.regular}
                                        color={isDisabled ? '#CCC' : isSelected ? theme.colors.text : theme.colors.grayDark}
                                        style={{ textAlign: 'center' }}
                                    >
                                        {method.name}
                                    </CustomText>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                        onPress={handlePay}
                        activeOpacity={0.8}
                        style={[styles.payButton, !selectedMethod && { backgroundColor: '#F8A5A5' }]}
                    >
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} color={theme.colors.white}>
                            {selectedMethod ? "Select Payment Method" : "Please Select Method"}
                        </CustomText>
                    </TouchableOpacity>
                </View>

                <UpiModal
                    visible={showUpiModal}
                    onClose={handleUpiClose}
                    payableAmount={totalPayable}
                    qrString={`upi://pay?pa=devourin@bank&am=${totalPayable}&tn=OrderReceipt`}
                />
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
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.border.md,
        gap: theme.spacing.xs,
    },
    devourinLogo: {
        width: 150,
        height: 40,
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    paymentCard: {
        backgroundColor: '#fff',
        borderRadius: 40,
        padding: theme.spacing.xxxl,
        width: '90%',
        maxWidth: 700,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 30,
        elevation: 5,
    },
    totalLabel: {
        color: '#162640',
        marginBottom: theme.spacing.md,
    },
    totalValue: {
        marginBottom: theme.spacing.xxxl,
    },
    selectTitle: {
        color: '#162640',
        marginBottom: theme.spacing.xl,
    },
    methodsRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'center',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.xxxl,
    },
    methodCard: {
        flex: 1,
        maxWidth: 180,
        aspectRatio: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.md,
    },
    methodCardSelected: {
        borderColor: theme.colors.theme,
        borderWidth: 2,
    },
    methodCardDisabled: {
        backgroundColor: '#F9F9F9',
        opacity: 0.6,
    },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    iconBoxSelected: {
        backgroundColor: '#FFEAD1',
    },
    payButton: {
        width: '100%',
        height: 80,
        backgroundColor: '#F8A5A5', // Standard disabled-ish red look from screenshot
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
