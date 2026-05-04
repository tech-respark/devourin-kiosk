import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import CustomText from '../components/CustomText';
import { UpiModal } from '../components/UpiModal';
import { clearCart, selectCartItems } from '../src/store/cartSlice';
import { clearCustomerDetails, selectApplicationConfigs, selectMobileSettings } from '../src/store/userSlice';
import { theme } from '../src/styles/theme';
import { buildPluralOrderPayload } from '../src/utils/Cart';
import { useEnvironment } from '../src/utils/Constants';
import { loadRazorpayScript, makeAPIRequest } from '../src/utils/Helper';
import { calculateCartTotals } from '../src/utils/taxCalculation';

type LoaderState = 'idle' | 'payment' | 'placing' | 'success' | 'error';
type PaymentMethod = 'upi' | 'other';
const UPI_PAYMENT_TIMEOUT_SECONDS = 180;
const UPI_PAYMENT_STATUS_POLL_MS = 3000;
const UPI_SUCCESS_STATUS = 'QSR_KOT_BILL_SETTLED';
const UPI_PENDING_STATUS = 'NO_STATUS';
const UPI_LOGO_URI = require('../assets/icons/upi.png');

export default function PaymentSelection() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { apiBaseUrl } = useEnvironment();
    const cartItems = useSelector(selectCartItems);
    const mobileSettings = useSelector(selectMobileSettings);
    const applicationConfigs = useSelector(selectApplicationConfigs);
    const currency = mobileSettings?.['currency_symbol'] || '₹';

    const cartTotals = useMemo(() => calculateCartTotals(cartItems as any, applicationConfigs), [cartItems, applicationConfigs]);
    const totalPayable = cartTotals.grandTotal;

    const [loaderState, setLoaderState] = useState<LoaderState>('idle');
    const [loaderText, setLoaderText] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('upi');
    const [upiOrderResponse, setUpiOrderResponse] = useState<any>(null);
    const [upiModalVisible, setUpiModalVisible] = useState(false);
    const [upiExpiresAt, setUpiExpiresAt] = useState<number | null>(null);
    const [upiRemainingSeconds, setUpiRemainingSeconds] = useState(UPI_PAYMENT_TIMEOUT_SECONDS);
    const isPollingUpiStatus = useRef(false);

    const breakdown = {
        subtotal: cartTotals.subtotal,
        cgst: cartTotals.taxBreakdown.cgst,
        sgst: cartTotals.taxBreakdown.sgst,
        igst: cartTotals.taxBreakdown.igst,
        vat: cartTotals.taxBreakdown.vat,
        pc: cartTotals.taxBreakdown.pc,
    };

    useEffect(() => {
        if (!upiModalVisible || !upiExpiresAt) return;

        const tick = () => {
            const secondsLeft = Math.max(0, Math.ceil((upiExpiresAt - Date.now()) / 1000));
            setUpiRemainingSeconds(secondsLeft);

            if (secondsLeft <= 0) {
                setUpiModalVisible(false);
                setUpiOrderResponse(null);
                setUpiExpiresAt(null);
                Toast.show({
                    type: 'info',
                    text1: 'UPI payment expired',
                    text2: 'Please generate a new QR code to continue.'
                });
            }
        };

        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [upiExpiresAt, upiModalVisible]);

    useEffect(() => {
        if (!upiModalVisible || !upiOrderResponse) return;
        let isActive = true;

        const pollPaymentStatus = async () => {
            if (isPollingUpiStatus.current) return;
            isPollingUpiStatus.current = true;
            const orderId = upiOrderResponse?.app_order_id;
            const statusResp = await makeAPIRequest(`${apiBaseUrl}kiosk/payment/status?orderId=${orderId}`, null, 'GET');
            isPollingUpiStatus.current = false;
            const paymentStatus = statusResp?.status || statusResp?.data?.status;
            if (!isActive || !paymentStatus) return;
            if (paymentStatus === UPI_PENDING_STATUS) {
                return;
            }
            if (paymentStatus === UPI_SUCCESS_STATUS) {
                setLoaderState('success');
                setLoaderText('Order Successful!');
                setUpiModalVisible(false);
                dispatch(clearCart());
                dispatch(clearCustomerDetails());
                router.replace({ pathname: '/confirmation', params: { orderId: upiOrderResponse?.app_order_id, token: upiOrderResponse?.kot_no } });
                return;
            }
            setUpiModalVisible(false);
            setUpiOrderResponse(null);
            setUpiExpiresAt(null);
            setLoaderState('error');
            setLoaderText('');
            Toast.show({
                type: 'error',
                text1: 'UPI payment failed',
                text2: 'Please try another payment method or generate a new QR code.'
            });
        };

        pollPaymentStatus();
        const pollTimer = setInterval(pollPaymentStatus, UPI_PAYMENT_STATUS_POLL_MS);

        return () => {
            isActive = false;
            clearInterval(pollTimer);
        };
    }, [apiBaseUrl, dispatch, router, upiModalVisible, upiOrderResponse]);

    const handleSuccess = async (data: any, razorResp: any) => {
        setLoaderState('success');
        setLoaderText('Order Successful!');

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

        router.replace({ pathname: '/confirmation', params: { orderId: razorResp?.app_order_id, token: razorResp?.kot_no } });
    };

    const handleFailure = (error: any) => {
        setLoaderState('error');
        setLoaderText('');
        Toast.show({
            type: 'error',
            text1: 'Payment Failed',
            text2: error.description || 'Transaction cancelled'
        });
    };

    const createRazorOrder = async (isQRPayment: boolean = false) => {
        setLoaderState('placing');
        setLoaderText('Validating Order...');

        const payload = buildPluralOrderPayload(cartItems as any, isQRPayment);
        const headers = { headers: { 'Content-Type': 'application/json', 'user': 'sadmin1234', 'pwd': 'sadmin1234' } }
        const validateResp = await makeAPIRequest(`${apiBaseUrl}validateOrder`, payload, 'POST', headers);

        if (!validateResp?.verified) {
            throw new Error('Order validation failed');
        }

        setLoaderText('Generating Payment Order...');
        const tempPayload = { ...payload, paymentVendor: 'Razorpay', isQRPayment: selectedPaymentMethod === 'upi' ? 1 : 0 };
        const razorResp = await makeAPIRequest(`${apiBaseUrl}razororder1`, tempPayload, 'POST', headers);

        if (!razorResp) {
            throw new Error('Failed to create Razorpay order');
        }

        return razorResp;
    };

    const openRazorpayCheckout = async (razorResp: any) => {
        if (!razorResp?.order_id) {
            throw new Error('Failed to create Razorpay order');
        }

        setLoaderState('payment');
        setLoaderText('Waiting for Payment...');

        const options = {
            ...razorResp,
            amount: Math.round(Number(razorResp.amount) * 100),
            description: razorResp.description || 'Devourin Kiosk Order',
            name: razorResp.name || 'Devourin',
            theme: { color: razorResp.theme?.color || '#D95C20' },
        };
        delete (options as any)['callback_url'];

        if (Platform.OS === 'web') {
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) throw new Error('Razorpay script failed to load');

            const rzp = new (window as any).Razorpay({
                ...options,
                handler: (response: any) => handleSuccess(response, razorResp),
                modal: { ondismiss: () => handleFailure({ description: 'Payment Dismissed' }) }
            });
            rzp.open();
        } else {
            RazorpayCheckout.open(options)
                .then((response: any) => handleSuccess(response, razorResp))
                .catch(handleFailure);
        }
    };

    const handleUpiPayment = async () => {
        const now = Date.now();
        if (upiOrderResponse && upiExpiresAt && upiExpiresAt > now) {
            setUpiRemainingSeconds(Math.ceil((upiExpiresAt - now) / 1000));
            setUpiModalVisible(true);
            return;
        }

        try {
            const razorResp = await createRazorOrder(true);
            const qrImageUrl = razorResp?.qr_image;
            console.log('Generated UPI QR Image URL:', qrImageUrl);
            if (!qrImageUrl) {
                throw new Error('UPI QR code was not returned');
            }

            setUpiOrderResponse(razorResp);
            setUpiExpiresAt(Date.now() + UPI_PAYMENT_TIMEOUT_SECONDS * 1000);
            setUpiRemainingSeconds(UPI_PAYMENT_TIMEOUT_SECONDS);
            setLoaderState('idle');
            setLoaderText('');
            setUpiModalVisible(true);
        } catch (e) {
            console.log(e);
            setLoaderState('error');
            setLoaderText('');
            Toast.show({ type: 'error', text1: 'Unable to start UPI payment. Please try again.' });
        }
    };

    const handleOtherPayment = async () => {
        try {
            const razorResp = await createRazorOrder();
            await openRazorpayCheckout(razorResp);
        } catch (e) {
            console.log(e);
            setLoaderState('error');
            setLoaderText('');
            Toast.show({ type: 'error', text1: 'Order failed. Please try again.' });
        }
    };

    const placeOrder = () => {
        if (selectedPaymentMethod === 'upi') {
            handleUpiPayment();
            return;
        }

        handleOtherPayment();
    };

    const isLoading = loaderState === 'payment' || loaderState === 'placing' || loaderState === 'success';

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
                    <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium}>Back</CustomText>
                </TouchableOpacity>
                <Image source={require('../assets/icons/logo.png')} style={styles.devourinLogo} resizeMode="contain" />
                <View style={{ width: 100 }} />
            </View>

            <View style={styles.mainContent}>
                <Image
                    source={require('../assets/icons/sihi_logo.png')}
                    style={styles.sihiLogo}
                    resizeMode="contain"
                />
                <View style={styles.paymentCard}>
                    {/* Header: Security Badge */}
                    <View style={styles.paymentBadge}>
                        <Ionicons name="card" size={20} color="#fff" />
                        <CustomText fontFamily={theme.fonts.Bold} color="#fff" style={{ marginLeft: 8, letterSpacing: 0.5 }}>SECURE PAYMENT</CustomText>
                    </View>

                    <CustomText fontFamily={theme.fonts.SemiBold} color="#666" style={styles.instructionText}>
                        Choose how you would like to complete your payment.
                    </CustomText>

                    {/* Order Summary Section */}
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryHeader}>
                            <Ionicons name="receipt-outline" size={18} color={theme.colors.theme} />
                            <CustomText fontFamily={theme.fonts.Bold} color="#666" style={{ marginLeft: 8 }}>Order Summary</CustomText>
                        </View>

                        <View style={styles.breakdownRow}>
                            <CustomText color="#888" fontSize={theme.fontSize.medium}>Items Subtotal</CustomText>
                            <CustomText fontFamily={theme.fonts.Medium} color="#444">{currency}{breakdown.subtotal.toFixed(2)}</CustomText>
                        </View>

                        {breakdown.cgst > 0 && (
                            <View style={styles.breakdownRow}>
                                <CustomText color="#888" fontSize={theme.fontSize.medium}>CGST {cartTotals.isReverseCalculation ? '(Incl.)' : ''}</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium} color="#444">{currency}{breakdown.cgst.toFixed(2)}</CustomText>
                            </View>
                        )}
                        {breakdown.sgst > 0 && (
                            <View style={styles.breakdownRow}>
                                <CustomText color="#888" fontSize={theme.fontSize.medium}>SGST {cartTotals.isReverseCalculation ? '(Incl.)' : ''}</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium} color="#444">{currency}{breakdown.sgst.toFixed(2)}</CustomText>
                            </View>
                        )}
                        {breakdown.igst > 0 && (
                            <View style={styles.breakdownRow}>
                                <CustomText color="#888" fontSize={theme.fontSize.medium}>IGST {cartTotals.isReverseCalculation ? '(Incl.)' : ''}</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium} color="#444">{currency}{breakdown.igst.toFixed(2)}</CustomText>
                            </View>
                        )}
                        {breakdown.vat > 0 && (
                            <View style={styles.breakdownRow}>
                                <CustomText color="#888" fontSize={theme.fontSize.medium}>VAT {cartTotals.isReverseCalculation ? '(Incl.)' : ''}</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium} color="#444">{currency}{breakdown.vat.toFixed(2)}</CustomText>
                            </View>
                        )}
                        {breakdown.pc > 0 && (
                            <View style={styles.breakdownRow}>
                                <CustomText color="#888" fontSize={theme.fontSize.medium}>Packing Charges</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium} color="#444">{currency}{breakdown.pc.toFixed(2)}</CustomText>
                            </View>
                        )}
                    </View>

                    {/* Total Amount Display */}
                    <View style={styles.totalContainer}>
                        <CustomText color="#888" fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.medium}>Payable Amount</CustomText>
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXXXX} color="#162640" style={styles.amountText}>
                            {currency}{totalPayable.toFixed(2)}
                        </CustomText>
                    </View>

                    <View style={styles.methodGrid}>
                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => setSelectedPaymentMethod('upi')}
                            style={[styles.methodCard, selectedPaymentMethod === 'upi' && styles.methodCardSelected]}
                        >
                            <Image source={UPI_LOGO_URI} style={styles.upiLogo} resizeMode="contain" />
                            <CustomText fontFamily={theme.fonts.SemiBold} color={selectedPaymentMethod === 'upi' ? theme.colors.theme : "#162640"} fontSize={theme.fontSize.medium} style={styles.methodTitle}>UPI QR</CustomText>
                        </TouchableOpacity>

                        <TouchableOpacity
                            activeOpacity={0.85}
                            onPress={() => setSelectedPaymentMethod('other')}
                            style={[styles.methodCard, selectedPaymentMethod === 'other' && styles.methodCardSelected]}
                        >
                            <View style={[styles.methodIcon, selectedPaymentMethod === 'other' && styles.methodIconSelected]}>
                                <Ionicons name="card-outline" size={28} color={selectedPaymentMethod === 'other' ? '#fff' : '#D95C20'} />
                            </View>
                            <CustomText fontFamily={theme.fonts.SemiBold} color={selectedPaymentMethod === 'other' ? theme.colors.theme : "#162640"} fontSize={theme.fontSize.medium} style={styles.methodTitle}>Cards & More</CustomText>
                        </TouchableOpacity>
                    </View>

                    {/* Pay Button */}
                    <TouchableOpacity
                        onPress={placeOrder}
                        activeOpacity={0.8}
                        disabled={isLoading}
                        style={styles.payBtnWrapper}
                    >
                        <LinearGradient
                            colors={['#DD7E33', '#D95C20']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.payBtn}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color="#fff">
                                        {selectedPaymentMethod === 'upi' ? 'PAY WITH UPI' : 'PAY WITH CARD'}
                                    </CustomText>
                                    <Ionicons name="arrow-forward" size={24} color="#fff" style={{ marginLeft: 10 }} />
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Security Footnote */}
                    <View style={styles.securityBox}>
                        <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
                        <CustomText color="#4CAF50" fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.small} style={{ marginLeft: 5 }}>
                            100% SECURE & ENCRYPTED
                        </CustomText>
                    </View>
                </View>
            </View>

            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color={theme.colors.theme} />
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingX} color={theme.colors.white} style={{ marginTop: 24 }}>
                        {loaderText}
                    </CustomText>
                </View>
            )}

            <UpiModal
                visible={upiModalVisible}
                onClose={() => setUpiModalVisible(false)}
                payableAmount={totalPayable}
                qrImageUrl={upiOrderResponse?.qr_image}
                remainingSeconds={upiRemainingSeconds}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FAFAFA' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        zIndex: 10,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FB',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.border.md,
        gap: theme.spacing.xs,
        width: 100,
    },
    devourinLogo: { width: 200, height: 40 },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#F8F9FB',
    },
    sihiLogo: {
        width: 300,
        height: 200,
        position: 'absolute',
        top: 50,
    },
    paymentCard: {
        backgroundColor: '#fff',
        borderRadius: 45,
        padding: 45,
        width: '100%',
        maxWidth: 500,
        marginTop: theme.spacing.xxxl,
        alignItems: 'center',
        ...Platform.select({
            web: { boxShadow: '0px 25px 60px rgba(0, 0, 0, 0.05)' },
            default: { elevation: 12 }
        })
    },
    paymentBadge: {
        backgroundColor: '#1A2B48',
        paddingHorizontal: 25,
        paddingVertical: 14,
        borderRadius: 100,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 35,
    },
    instructionText: {
        textAlign: 'center',
        color: '#777',
        lineHeight: 24,
        fontSize: 16,
        marginBottom: 24,
    },
    methodGrid: {
        width: '100%',
        flexDirection: 'row',
        gap: theme.spacing.md,
        marginBottom: 28,
    },
    methodCard: {
        flex: 1,
        minHeight: 108,
        borderWidth: 1.5,
        borderColor: '#ECEFF3',
        borderRadius: 18,
        padding: theme.spacing.md,
        backgroundColor: '#fff',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    methodCardSelected: {
        borderColor: '#D95C20',
        backgroundColor: '#FFF7F1',
        borderWidth: 2,
    },
    methodIcon: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#FFF1E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    upiLogo: {
        width: 160,
        height: 80,
        marginBottom: theme.spacing.md,
    },
    methodTitle: {
        textAlign: 'center',
    },
    methodIconSelected: {
        backgroundColor: '#D95C20',
    },
    summaryContainer: {
        width: '100%',
        backgroundColor: '#FBFBFC',
        padding: 20,
        borderRadius: 20,
        marginBottom: 30,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 10,
    },
    breakdownRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    totalContainer: {
        alignItems: 'center',
        marginBottom: 35,
    },
    amountText: {
        marginTop: 5,
        fontSize: 54,
    },
    payBtnWrapper: {
        width: '100%',
        marginBottom: 30,
    },
    payBtn: {
        height: 85,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    securityBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(22, 38, 64, 0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
});
