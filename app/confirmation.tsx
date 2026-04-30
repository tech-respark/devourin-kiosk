import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../components/CustomText';
import { theme } from '../src/styles/theme';
import { useEnvironment } from '../src/utils/Constants';
import { getLocalPrinterBaseUrl, makeAPIRequest } from '../src/utils/Helper';

const PRINTER_URL = `${getLocalPrinterBaseUrl()}/devourin-printing/v1/print`;

export default function ConfirmationScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const orderId = params.orderId as string;
    const token = params.token as string;
    const { apiBaseUrl } = useEnvironment();

    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const [seconds, setSeconds] = React.useState(10);
    const printAttempted = useRef(false);

    useEffect(() => {
        const handlePrint = async () => {
            if (!orderId || printAttempted.current) return;
            printAttempted.current = true;

            try {
                const url = `${apiBaseUrl}qsrkotandbillprintdata?id=${orderId}`;
                const printData = await makeAPIRequest(url, null, 'GET');
                if (printData && printData.length > 0) {
                    const printRequests: Promise<any>[] = [];
                    const kotPrints: any = [];
                    const modifiedPrinters = printData.map((printerItem: any) => {
                        if (printerItem.type === 'KOT') {
                            kotPrints.push(printerItem);
                        }
                        return { ...printerItem, printer: 'kiosk' };
                    });

                    // Send all printers marked as kiosk
                    printRequests.push(makeAPIRequest(PRINTER_URL, modifiedPrinters, 'POST', {}, '', true, undefined, false));

                    // Separately send KOT prints if they exist
                    if (kotPrints.length > 0) {
                        printRequests.push(makeAPIRequest(PRINTER_URL, kotPrints, 'POST', {}, '', true, undefined, false));
                    }

                    const results = await Promise.all(printRequests);
                    const allSucceeded = results.every(res => res && res.ok);

                    if (allSucceeded) {
                        console.log("All prints successful, calling settlement API...");
                        const headers = { headers: { 'Content-Type': 'application/json', 'id': orderId } }
                        await makeAPIRequest(`${apiBaseUrl}markorderkotprinted`, {}, 'POST', headers);
                    }
                }
            } catch (err) {
                console.error("Print flow failed:", err);
            }
        };

        handlePrint();

        // Animation sequence
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]).start();

        // Countdown logic
        const timer = setInterval(() => {
            setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (seconds === 0) {
            router.replace('/mode');
        }
    }, [seconds]);

    return (
        <SafeAreaView style={styles.container}>
            {/* Background Decorations */}
            <View style={styles.bgCircleTop} />
            <View style={styles.bgCircleBottom} />

            <View style={styles.content}>
                <Animated.View style={[styles.successIconContainer, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
                    <LinearGradient colors={['#4CAF50', '#2E7D32']} style={styles.iconGradient}>
                        <Ionicons name="checkmark" size={100} color="#fff" />
                    </LinearGradient>
                    {/* Pulsing rings around icon */}
                    <View style={styles.pulseRing1} />
                    <View style={styles.pulseRing2} />
                </Animated.View>

                <Animated.View style={{ opacity: opacityAnim, alignItems: 'center' }}>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXXXX} color="#162640" style={styles.title}>
                        Order Successful!
                    </CustomText>
                    <CustomText color={theme.colors.grayDark} fontSize={theme.fontSize.large} style={styles.subtitle}>
                        Thank you for your order. Our team is now preparing your delicious meal.
                    </CustomText>

                    <View style={styles.timerContainer}>
                        <CustomText color={theme.colors.grayDark} fontSize={theme.fontSize.medium}>
                            Redirecting to home in <CustomText fontFamily={theme.fonts.Bold} color={theme.colors.theme}>{seconds}s</CustomText>
                        </CustomText>
                    </View>

                    {token && (
                        <View style={styles.tokenSection}>
                            <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} color="#666">
                                YOUR TOKEN NUMBER
                            </CustomText>
                            <View style={styles.tokenCard}>
                                <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXXXX} color={theme.colors.theme}>
                                    {token}
                                </CustomText>
                            </View>
                        </View>
                    )}
                </Animated.View>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => router.replace('/mode')}
                    style={styles.btnWrapper}
                >
                    <LinearGradient
                        colors={['#DD7E33', '#D95C20']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.homeBtn}
                    >
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color="#fff">
                            Place New Order
                        </CustomText>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            <View style={styles.footer}>
                <Image source={require('../assets/icons/logo.png')} style={styles.footerLogo} resizeMode="contain" />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    bgCircleTop: {
        position: 'absolute',
        top: -150,
        right: -150,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#EBFBF5',
        opacity: 0.6,
    },
    bgCircleBottom: {
        position: 'absolute',
        bottom: -100,
        left: -100,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#FEF7EB',
        opacity: 0.6,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 40,
    },
    successIconContainer: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 60,
    },
    iconGradient: {
        width: 160,
        height: 160,
        borderRadius: 80,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        ...Platform.select({
            web: {
                boxShadow: '0px 10px 20px rgba(76, 175, 80, 0.3)'
            },
            default: {
                shadowColor: "#4CAF50",
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
            }
        }),
        elevation: 10,
    },
    pulseRing1: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#E8F5E9',
    },
    pulseRing2: {
        position: 'absolute',
        width: 240,
        height: 240,
        borderRadius: 120,
        borderWidth: 1,
        borderColor: '#E8F5E9',
    },
    title: {
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        textAlign: 'center',
        lineHeight: 28,
        maxWidth: 500,
        marginBottom: 40,
    },
    timerContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        marginBottom: 60,
    },
    btnWrapper: {
        width: '100%',
        maxWidth: 400,
    },
    homeBtn: {
        height: 70,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            web: {
                boxShadow: '0px 8px 15px rgba(217, 92, 32, 0.2)'
            },
            default: {
                shadowColor: "#D95C20",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.2,
                shadowRadius: 15,
            }
        }),
        elevation: 8,
    },
    footer: {
        paddingBottom: 40,
        alignItems: 'center',
    },
    footerLogo: {
        width: 140,
        height: 40,
        opacity: 0.5,
    },
    tokenSection: {
        alignItems: 'center',
        marginVertical: 40,
    },
    tokenCard: {
        backgroundColor: '#fff',
        paddingHorizontal: 80,
        paddingVertical: 25,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: theme.colors.theme,
        marginTop: 15,
        ...Platform.select({
            web: {
                boxShadow: `0px 10px 20px ${theme.colors.theme}1A` // 1A is ~0.1 opacity
            },
            default: {
                shadowColor: theme.colors.theme,
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
            }
        }),
        elevation: 5,
    },
});
