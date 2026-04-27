import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import CustomText from '../components/CustomText';
import { UpiModal } from '../components/UpiModal';
import { clearCart, selectCartItems, selectCartSubtotal } from '../src/store/cartSlice';
import { clearCustomerDetails } from '../src/store/userSlice';
import { theme } from '../src/styles/theme';
import { buildKioskOrderPayload } from '../src/utils/Cart';
import { useEnvironment } from '../src/utils/Constants';
import { makeAPIRequest } from '../src/utils/Helper';

const PAYMENT_METHODS = [
    { id: 'upi', name: 'UPI / QR', icon: 'qr-code', disabled: false, type: 'material', txn: 'UPI' },
    { id: 'card', name: 'Credit / Debit', icon: 'credit-card', disabled: true, type: 'material', txn: 'Card' },
    { id: 'cash', name: 'Cash Counter', icon: 'payments', disabled: true, type: 'material', txn: 'Cash' },
];

type LoaderState = 'idle' | 'payment' | 'placing' | 'success' | 'error';

export default function PaymentSelection() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { apiBaseUrl } = useEnvironment();
    const totalPayable = useSelector(selectCartSubtotal);
    const cartItems = useSelector(selectCartItems);

    const [selectedMethod, setSelectedMethod] = useState('upi');
    const [showUpiModal, setShowUpiModal] = useState(false);
    const [loaderState, setLoaderState] = useState<LoaderState>('idle');
    const [loaderText, setLoaderText] = useState('');

    const selectedTxnName = PAYMENT_METHODS.find(m => m.id === selectedMethod)?.txn ?? 'UPI';

    const placeOrder = async () => {
        setLoaderState('placing');
        setLoaderText('Placing your order...');
        try {
            const payload = buildKioskOrderPayload(cartItems as any, selectedTxnName);
            const reqId = Date.now();
            const headers: any = { headers: { 'Content-Type': 'application/json', rqid: reqId } };
            console.log(JSON.stringify(payload))
            const response = await makeAPIRequest(`${apiBaseUrl}orderbystaffmobile`, payload, 'POST', headers);
            if (response) {
                dispatch(clearCart());
                dispatch(clearCustomerDetails());
                router.replace('/confirmation');
            } else {
                setLoaderState('error');
                setLoaderText('');
                Toast.show({ type: 'error', text1: 'Order failed. Please try again.' });
            }
        } catch (e) {
            setLoaderState('error');
            setLoaderText('');
            Toast.show({ type: 'error', text1: 'Something went wrong. Please try again.' });
        }
    };

    // Called when UPI modal "confirms" payment (mock flow)
    const handleUpiPaymentConfirmed = async () => {
        setShowUpiModal(false);
        // 3-second mock payment processing
        setLoaderState('payment');
        setLoaderText('Processing Payment...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        setLoaderState('success');
        setLoaderText('Payment Successful!');
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Call the real order API
        await placeOrder();
    };

    const handlePay = () => {
        if (selectedMethod === 'upi') {
            setShowUpiModal(true);
        }
    };

    const isLoading = loaderState === 'payment' || loaderState === 'placing' || loaderState === 'success';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
                    <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium}>Back</CustomText>
                </TouchableOpacity>
                <Image source={require('../assets/icons/logo.png')} style={styles.devourinLogo} resizeMode="contain" />
                <View style={{ width: 100 }} />
            </View>

            {/* Main Content */}
            <View style={styles.mainContent}>
                <View style={styles.paymentCard}>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} style={styles.totalLabel}>
                        Total Payable Amount
                    </CustomText>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXXXX} color="#D13C25" style={styles.totalValue}>
                        ₹{totalPayable.toFixed(0)}
                    </CustomText>

                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} style={styles.selectTitle}>
                        Select Payment Method
                    </CustomText>

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
                                        isDisabled && styles.methodCardDisabled,
                                    ]}
                                    onPress={() => setSelectedMethod(method.id)}
                                >
                                    <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>

                                        <MaterialIcons name={method.icon as any} size={32} color={isDisabled ? '#CCC' : '#333'} />

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

                    {/* Pay Button */}
                    <TouchableOpacity
                        onPress={handlePay}
                        activeOpacity={0.85}
                        disabled={!selectedMethod || isLoading}
                    >
                        <LinearGradient
                            colors={selectedMethod ? ['#DD7E33', '#D95C20'] : ['#CCC', '#CCC']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.payButton}
                        >
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} color={theme.colors.white}>
                                Pay ₹{totalPayable.toFixed(0)}
                            </CustomText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <UpiModal
                    visible={showUpiModal}
                    onClose={() => setShowUpiModal(false)}
                    payableAmount={totalPayable}
                    qrString={`upi://pay?pa=devourin@bank&am=${totalPayable}&tn=OrderReceipt`}
                    onPaymentConfirm={handleUpiPaymentConfirmed}
                />
            </View>

            {/* Loading Overlay */}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    {loaderState === 'success' ? (
                        <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                    ) : (
                        <ActivityIndicator size="large" color={theme.colors.theme} />
                    )}
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingX} color={theme.colors.white} style={{ marginTop: 24 }}>
                        {loaderText}
                    </CustomText>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
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
    devourinLogo: { width: 150, height: 40 },
    mainContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg, backgroundColor: theme.colors.background },
    paymentCard: {
        backgroundColor: '#fff',
        borderRadius: 40,
        padding: theme.spacing.xxxl,
        width: '90%',
        maxWidth: 700,
        alignItems: 'center',
        boxShadow: '0px 10px 30px 0px rgba(0,0,0,0.07)',
    },
    totalLabel: { color: '#162640', marginBottom: theme.spacing.md },
    totalValue: { marginBottom: theme.spacing.xxxl },
    selectTitle: { color: '#162640', marginBottom: theme.spacing.xl },
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
    methodCardSelected: { borderColor: theme.colors.theme, borderWidth: 2 },
    methodCardDisabled: { backgroundColor: '#F9F9F9', opacity: 0.6 },
    iconBox: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    iconBoxSelected: { backgroundColor: '#FFEAD1' },
    payButton: {
        width: 400,
        height: 80,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.75)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
});
