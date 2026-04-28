import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, BackHandler, Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { AdminModal } from '../components/AdminModal';
import CustomText from '../components/CustomText';
import { useInitialDataFetch } from '../src/hooks/useInitialDataFetch';
import { clearCart } from '../src/store/cartSlice';
import { selectOrganisedMenuItems } from '../src/store/menuSlice';
import { resetUser } from '../src/store/userSlice';
import { theme } from '../src/styles/theme';

export default function ModeSelectionScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const organisedMenu = useSelector(selectOrganisedMenuItems);
    const { callInitialSetUpAPIAsync, loading } = useInitialDataFetch();

    // If data already exists in redux, we don't need to show "Synchronizing" loader
    const [isConfigured, setIsConfigured] = useState(organisedMenu && organisedMenu.length > 0);

    // Admin Modal Logic
    const [logoClickCount, setLogoClickCount] = useState(0);
    const [showAdminModal, setShowAdminModal] = useState(false);

    useEffect(() => {
        // Prevent back navigation on Android
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

        // Prevent back navigation on Web
        if (Platform.OS === 'web') {
            window.history.pushState(null, '', window.location.href);
            window.onpopstate = function () {
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

        return () => {
            backHandler.remove();
            if (Platform.OS === 'web') {
                window.onpopstate = null;
            }
        };
    }, []);

    const handleSelectMode = (mode: string) => {
        router.replace('/menu');
    };

    const handleLogoClick = () => {
        const newCount = logoClickCount + 1;
        setLogoClickCount(newCount);
        if (newCount >= 5) {
            setShowAdminModal(true);
            setLogoClickCount(0);
        }
        // Auto reset click count if no click for 3 seconds
        setTimeout(() => setLogoClickCount(0), 3000);
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
                {/* Restaurant Logo with Hidden Click Handle */}
                <Pressable onPress={handleLogoClick} style={styles.logoContainer}>
                    <Image
                        source={require('../assets/icons/sihi_logo.png')}
                        style={styles.restaurantLogo}
                        resizeMode="contain"
                    />
                </Pressable>

                {/* Center Group */}
                <View style={styles.centerGroup}>
                    <View style={styles.questionContainer}>
                        <CustomText
                            fontFamily={theme.fonts.SemiBold}
                            fontSize={theme.fontSize.headingXXX}
                            color="#222"
                            style={styles.questionText}
                        >
                            How would you like to order?
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
                                    <MaterialCommunityIcons name="silverware-fork-knife" size={100} color="#fff" />
                                </View>
                                <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXX} color="#fff">
                                    Order Now
                                </CustomText>
                            </LinearGradient>
                        </Pressable>

                        {/* <Pressable onPress={() => handleSelectMode('Takeaway')}>
                            <LinearGradient
                                colors={['#DD7E33', '#D95C20']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.modeButton}
                            >
                                <View style={styles.iconWrapper}>
                                    <Ionicons name="bag-handle" size={100} color="#fff" />
                                </View>
                                <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXX} color="#fff">
                                    Takeaway
                                </CustomText>
                            </LinearGradient>
                        </Pressable> */}
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.poweredContainer}>
                        <CustomText fontSize={theme.fontSize.medium} color="#666">
                            Powered By
                        </CustomText>
                        <Image
                            source={require('../assets/icons/logo.png')}
                            style={styles.devourinLogo}
                            resizeMode="contain"
                        />
                    </View>
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
    backgroundLayer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '35%',
        height: '100%',
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
        width: '70%',
        height: 250,
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
    },
    questionContainer: {
        marginBottom: theme.spacing.xl,
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
        width: 280,
        height: 340,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        ...(Platform.OS === 'web' ? {
            boxShadow: '0px 15px 20px rgba(0, 0, 0, 0.2)'
        } : {
            shadowOffset: { width: 0, height: 15 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
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
        gap: 10,
    },
    devourinLogo: {
        width: 150,
        height: 50,
    },
});
