import { useEnvironment } from '@/src/utils/Constants';
import { getLocalPrinterBaseUrl, makeAPIRequest, settingMenuItems } from '@/src/utils/Helper';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { AdminModal } from '../components/AdminModal';
import CustomText from '../components/CustomText';
import { useInitialDataFetch } from '../src/hooks/useInitialDataFetch';
import { clearCart } from '../src/store/cartSlice';
import { resetMenu, selectCategories, selectOrganisedMenuItems, selectRowMenuItems } from '../src/store/menuSlice';
import { resetUser, selectBranchId } from '../src/store/userSlice';
import { theme } from '../src/styles/theme';

const LogoImage = require('../assets/icons/menu_image.png');

export default function ModeSelectionScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const rawMenu = useSelector(selectRowMenuItems);
    const categories = useSelector(selectCategories);
    const { apiBaseUrl } = useEnvironment();
    const branchId = useSelector(selectBranchId);
    const organisedMenu = useSelector(selectOrganisedMenuItems);
    const { callInitialSetUpAPIAsync, loading } = useInitialDataFetch();

    // If data already exists in redux, we don't need to show "Synchronizing" loader
    const [isConfigured, setIsConfigured] = useState(organisedMenu && organisedMenu.length > 0);

    // Admin Modal Logic
    const [showAdminModal, setShowAdminModal] = useState(false);
    const [isPrinterOffline, setIsPrinterOffline] = useState(false);
    const [isPrinterChecking, setIsPrinterChecking] = useState(false);

    const checkPrinterStatus = async () => {
        if (__DEV__) return;
        const url = `${getLocalPrinterBaseUrl()}/devourin-printing/v1/listprinters`
        setIsPrinterChecking(true);
        setIsPrinterOffline(true);
        Toast.hide();

        try {
            const response = await makeAPIRequest(url, null, "GET", {}, "Printer Error", false);
            if (!response) {
                setIsPrinterOffline(true);
                Toast.show({ type: 'printerError', text1: 'Printer Offline', autoHide: false, props: { onRetry: checkPrinterStatus } });
            } else {
                setIsPrinterOffline(false);
                Toast.hide();
            }
        } catch (e) {
            setIsPrinterOffline(true);
            Toast.show({ type: 'printerError', text1: 'Printer Offline', autoHide: false, props: { onRetry: checkPrinterStatus } });
        } finally {
            setIsPrinterChecking(false);
        }
    };

    useEffect(() => {
        // Prevent back navigation on Android
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

        // Prevent back navigation on Web
        if (Platform.OS === 'web') {
            window.history.pushState(null, '', window.location.href);
            window.onpopstate = () => {
                window.history.pushState(null, '', window.location.href);
            };
        }

        const initializeSystem = async () => {
            // Only fetch if we don't have data yet
            if (!organisedMenu || organisedMenu.length === 0) {
                await callInitialSetUpAPIAsync();
            }
            setIsConfigured(true);
        };
        initializeSystem();
        checkPrinterStatus();

        return () => {
            backHandler.remove();
            if (Platform.OS === 'web') {
                window.onpopstate = null;
            }
        };
    }, []);

    const handleSelectMode = async (mode: string) => {
        //here we will call getCurrentItems again and we need to setup the menu again now you check the easiest way to do it ( less complexity )
        await settingMenuItems(rawMenu, categories, apiBaseUrl, branchId);
        // Trigger Fullscreen on Web to provide a native kiosk experience
        if (Platform.OS === 'web' && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {
                console.log("Fullscreen request blocked/failed");
            });
        }
        router.replace('/menu');
    };

    const handleLogoLongPress = () => {
        setShowAdminModal(true);
    };

    const handleResync = async () => {
        setShowAdminModal(false);
        setIsConfigured(false);
        await callInitialSetUpAPIAsync();
        setIsConfigured(true);
    };

    const handleLogout = () => {
        setShowAdminModal(false);
        dispatch(resetUser());
        dispatch(resetMenu());
        dispatch(clearCart());
        router.replace('/login');
    };

    if (loading || !isConfigured) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.theme} />
                <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} style={styles.loadingText}>
                    Synchronizing Menu Data...
                </CustomText>
            </SafeAreaView>
        );
    }

    return (
        <View style={styles.mainContainer}>
            {/* Blocking Overlay if printer is offline */}
            {isPrinterOffline && (
                <View style={styles.blockOverlay}>
                    {isPrinterChecking && <ActivityIndicator size="large" color={theme.colors.theme} />}
                </View>
            )}

            {/* Background Layer */}
            <View style={styles.backgroundLayer}>
                <Image
                    source={require('../assets/icons/landing_page_bg.jpg')}
                    style={styles.bgImage}
                    resizeMode="cover"
                />
            </View>

            {/* Main Content Layer */}
            <SafeAreaView style={styles.contentLayer}>
                {/* Restaurant Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/icons/sihi_logo.png')}
                        style={styles.restaurantLogo}
                        resizeMode="contain"
                    />
                </View>

                {/* Center Group */}
                <View style={styles.centerGroup}>
                    <View style={styles.questionContainer}>
                        <CustomText
                            fontFamily={theme.fonts.Medium}
                            fontSize={theme.fontSize.headingXXX}
                            color="#222"
                            style={styles.questionText}
                        >
                            Ready to order ?
                        </CustomText>
                    </View>

                    {/* Options Cards */}
                    <View style={styles.optionsContainer}>
                        <Pressable onPress={() => handleSelectMode('Dinein')}>
                            <LinearGradient
                                colors={['#DD7E33', '#D95C20']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.modeButton}
                            >
                                <View style={styles.iconWrapper}>
                                    <Image source={LogoImage} style={{ width: 120, height: 120 }} />
                                </View>
                                <CustomText fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.headingXXX} color="#fff">
                                    Order Now
                                </CustomText>
                            </LinearGradient>
                        </Pressable>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Pressable
                        onLongPress={handleLogoLongPress}
                        delayLongPress={2000}
                        style={styles.poweredContainer}
                        // @ts-ignore
                        onContextMenu={(e: any) => e.preventDefault()}
                    >
                        <CustomText fontSize={theme.fontSize.heading} color='#666'>
                            Powered By
                        </CustomText>
                        <Image
                            source={require('../assets/icons/logo.png')}
                            style={styles.devourinLogo}
                            resizeMode="contain"
                        />
                    </Pressable>
                </View>
            </SafeAreaView>

            <AdminModal
                visible={showAdminModal}
                onClose={() => setShowAdminModal(false)}
                onResync={handleResync}
                onLogout={handleLogout}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: theme.spacing.md,
        color: theme.colors.grayDark,
    },
    mainContainer: {
        flex: 1,
        backgroundColor: '#FAFAFA'
    },
    blockOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255,255,255,0.4)',
        zIndex: 999,
        alignItems: 'center',
        justifyContent: 'center'
    },
    backgroundLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
    },
    bgImage: {
        width: '100%',
        height: '100%',
    },
    contentLayer: {
        flex: 1,
        zIndex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    logoContainer: {
        marginTop: theme.spacing.xxxl,
        width: '80%',
        height: 280,
        justifyContent: 'center',
        alignItems: 'center',
    },
    restaurantLogo: {
        width: '100%',
        height: '100%',
    },
    centerGroup: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: -100
    },
    questionContainer: {
        marginBottom: theme.spacing.xxxl,
    },
    questionText: {
        textAlign: 'center',
    },
    optionsContainer: {
        flexDirection: 'row',
        gap: theme.spacing.xxl,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    modeButton: {
        width: 300,
        height: 340,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        ...Platform.select({
            web: {
                boxShadow: '0px 15px 20px rgba(0, 0, 0, 0.2)'
            },
            default: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 15 },
                shadowOpacity: 0.2,
                shadowRadius: 20,
            }
        }),
        elevation: 10,
    },
    iconWrapper: {
        marginBottom: theme.spacing.xl,
    },
    footer: {
        marginBottom: theme.spacing.xl,
        width: '100%',
        alignItems: 'center',
    },
    poweredContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        opacity: 0.8,
        padding: theme.spacing.sm,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.border.xl,
        ...(Platform.OS === 'web' ? {
            userSelect: 'none',
            WebkitUserSelect: 'none',
        } : {}),
    },
    devourinLogo: {
        width: 200,
        height: 50,
    },
});
