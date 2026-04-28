import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import CustomText from '../components/CustomText';
import { TaxBreakdownModal } from '../components/TaxBreakdownModal';
import { clearCart, selectCartItems, selectCartTotalWithTaxes } from '../src/store/cartSlice';
import { clearCustomerDetails } from '../src/store/userSlice';
import { theme } from '../src/styles/theme';
import { buildPluralOrderPayload } from '../src/utils/Cart';
import { useEnvironment } from '../src/utils/Constants';
import { makeAPIRequest } from '../src/utils/Helper';

type LoaderState = 'idle' | 'payment' | 'placing' | 'success' | 'error';

// Dynamic script loader for Razorpay Web
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        if (typeof document === 'undefined') return resolve(false);
        if ((window as any).Razorpay) return resolve(true);

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export default function PaymentSelection() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { apiBaseUrl } = useEnvironment();
    const totalPayable = useSelector(selectCartTotalWithTaxes);
    const cartItems = useSelector(selectCartItems);

    const [loaderState, setLoaderState] = useState<LoaderState>('idle');
    const [loaderText, setLoaderText] = useState('');
    const [showTaxModal, setShowTaxModal] = useState(false);

    const handleSuccess = async (data: any) => {
        console.log("Payment Success Handler:", data);
        setLoaderState('success');
        setLoaderText('Order Successful!');

        // Convert Razorpay response to x-www-form-urlencoded string
        let verifyPayload = "razorpay_payment_id=" + data.razorpay_payment_id +
            "&razorpay_order_id=" + data.razorpay_order_id +
            "&razorpay_signature=" + data.razorpay_signature;

        try {
            const url = `${apiBaseUrl}redirectrazorpay`;
            await makeAPIRequest(url, verifyPayload, 'POST', { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }, undefined, true, undefined, false);
        } catch (error) {
            console.error("Razorpay Callback API Error:", error);
        }

        dispatch(clearCart());
        dispatch(clearCustomerDetails());
        
        // Pass the actual order ID from Razorpay response to confirmation screen
        const orderId = data?.razorpay_order_id || '';
        router.replace({ pathname: '/confirmation', params: { orderId } });
    };

    const handleFailure = (error: any) => {
        console.log("Payment Failure Handler:", error);
        setLoaderState('error');
        setLoaderText('');
        Toast.show({
            type: 'error',
            text1: 'Payment Failed',
            text2: error.description || 'Transaction cancelled'
        });
    };

    const placeOrder = async () => {
        setLoaderState('placing');
        setLoaderText('Validating Order...');

        try {
            const payload = buildPluralOrderPayload(cartItems as any);
            console.log(JSON.stringify(payload))
            const headers = { headers: { 'Content-Type': 'application/json', 'user': 'sadmin1234', 'pwd': 'sadmin1234' } }
            console.log(`${apiBaseUrl}validateOrder`)
            const validateResp = await makeAPIRequest(`${apiBaseUrl}validateOrder`, payload, 'POST', headers);

            if (validateResp && validateResp.verified) {
                setLoaderText('Generating Payment Order...');

                const tempPayload = { ...payload, paymentVendor: 'Razorpay' }
                const razorResp = await makeAPIRequest(`${apiBaseUrl}razororder1`, tempPayload, 'POST', headers);

                if (razorResp && razorResp.order_id) {
                    setLoaderState('payment');
                    setLoaderText('Waiting for Payment...');

                    const options = {
                        ...razorResp,
                        // Convert to paise for Razorpay
                        amount: Math.round(Number(razorResp.amount) * 100),
                        description: razorResp.description || 'Devourin Kiosk Order',
                        name: razorResp.name || 'Devourin',
                        theme: { color: razorResp.theme?.color || '#D95C20' },
                    };
                    delete (options as any)['callback_url'];

                    if (Platform.OS === 'web') {
                        // WEB FLOW
                        const isScriptLoaded = await loadRazorpayScript();
                        if (!isScriptLoaded) throw new Error('Razorpay script failed to load');

                        const rzp = new (window as any).Razorpay({
                            ...options,
                            handler: (response: any) => handleSuccess(response),
                            modal: { ondismiss: () => handleFailure({ description: 'Payment Dismissed' }) }
                        });
                        rzp.open();
                    } else {
                        // NATIVE FLOW
                        RazorpayCheckout.open(options)
                            .then(handleSuccess)
                            .catch(handleFailure);
                    }
                } else {
                    throw new Error('Failed to create Razorpay order');
                }
            } else {
                throw new Error('Order validation failed');
            }
        } catch (e) {
            console.log(e);
            setLoaderState('error');
            setLoaderText('');
            Toast.show({ type: 'error', text1: 'Order failed. Please try again.' });
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
                    <View style={styles.totalRowContainer}>
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXXXX} color="#D13C25" style={styles.totalValue}>
                            ₹{totalPayable.toFixed(2)}
                        </CustomText>
                        <TouchableOpacity onPress={() => setShowTaxModal(true)} style={styles.infoIcon}>
                            <Ionicons name="information-circle-outline" size={32} color={theme.colors.grayDark} />
                        </TouchableOpacity>
                    </View>

                    {/* Pay Button */}
                    <TouchableOpacity
                        onPress={placeOrder}
                        activeOpacity={0.85}
                        disabled={isLoading}
                    >
                        <LinearGradient
                            colors={['#DD7E33', '#D95C20']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.payButton}
                        >
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} color={theme.colors.white}>
                                Continue to payment
                            </CustomText>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
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
            <TaxBreakdownModal
                visible={showTaxModal}
                onClose={() => setShowTaxModal(false)}
                cartItems={cartItems}
            />
        </SafeAreaView>
    );
}

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
    devourinLogo: { width: 200, height: 40 },
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
    totalRowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.xxxl,
        gap: 12
    },
    totalValue: { marginBottom: 0 },
    infoIcon: {
        padding: 4,
    },
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
        marginTop: theme.spacing.xxl
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.75)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
});
