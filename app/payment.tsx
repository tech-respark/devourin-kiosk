import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import CustomText from '../components/CustomText';
import { clearCart, selectCartItems, selectCartTotalWithTaxes } from '../src/store/cartSlice';
import { clearCustomerDetails, selectMobileSettings } from '../src/store/userSlice';
import { theme } from '../src/styles/theme';
import { buildPluralOrderPayload } from '../src/utils/Cart';
import { useEnvironment } from '../src/utils/Constants';
import { loadRazorpayScript, makeAPIRequest } from '../src/utils/Helper';

type LoaderState = 'idle' | 'payment' | 'placing' | 'success' | 'error';

export default function PaymentSelection() {
    const router = useRouter();
    const dispatch = useDispatch();
    const { apiBaseUrl } = useEnvironment();
    const totalPayable = useSelector(selectCartTotalWithTaxes);
    const cartItems = useSelector(selectCartItems);
    const mobileSettings = useSelector(selectMobileSettings);
    const currency = mobileSettings?.['currency_symbol'] || '₹';

    const [loaderState, setLoaderState] = useState<LoaderState>('idle');
    const [loaderText, setLoaderText] = useState('');

    const breakdown = useMemo(() => {
        let subtotal = 0;
        let cgst = 0;
        let sgst = 0;
        let igst = 0;
        let vat = 0;

        cartItems.forEach(item => {
            const itemBase = item.price * (item.quantity || 1);
            subtotal += itemBase;
            cgst += (itemBase * (item.cgst || 0)) / 100;
            sgst += (itemBase * (item.sgst || 0)) / 100;
            igst += (itemBase * (item.igst || 0)) / 100;
            vat += (itemBase * (item.vat || 0)) / 100;

            (item.addOns || []).forEach((addon: any) => {
                const addonBase = addon.price * (addon.quantity || 1);
                subtotal += addonBase;
                cgst += (addonBase * (addon.cgst || 0)) / 100;
                sgst += (addonBase * (addon.sgst || 0)) / 100;
                igst += (addonBase * (addon.igst || 0)) / 100;
                vat += (addonBase * (addon.vat || 0)) / 100;
            });
        });

        return { subtotal, cgst, sgst, igst, vat };
    }, [cartItems]);

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

    const placeOrder = async () => {
        setLoaderState('placing');
        setLoaderText('Validating Order...');

        try {
            const payload = buildPluralOrderPayload(cartItems as any);
            const headers = { headers: { 'Content-Type': 'application/json', 'user': 'sadmin1234', 'pwd': 'sadmin1234' } }
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
                        Please complete your payment using{"\n"}Razorpay to process your order.
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
                                <CustomText color="#888" fontSize={theme.fontSize.medium}>CGST</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium} color="#444">{currency}{breakdown.cgst.toFixed(2)}</CustomText>
                            </View>
                        )}
                        {breakdown.sgst > 0 && (
                            <View style={styles.breakdownRow}>
                                <CustomText color="#888" fontSize={theme.fontSize.medium}>SGST</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium} color="#444">{currency}{breakdown.sgst.toFixed(2)}</CustomText>
                            </View>
                        )}
                        {breakdown.igst > 0 && (
                            <View style={styles.breakdownRow}>
                                <CustomText color="#888" fontSize={theme.fontSize.medium}>IGST</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium} color="#444">{currency}{breakdown.igst.toFixed(2)}</CustomText>
                            </View>
                        )}
                        {breakdown.vat > 0 && (
                            <View style={styles.breakdownRow}>
                                <CustomText color="#888" fontSize={theme.fontSize.medium}>VAT</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium} color="#444">{currency}{breakdown.vat.toFixed(2)}</CustomText>
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
                                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color="#fff">PAY NOW</CustomText>
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
        marginBottom: 35,
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
