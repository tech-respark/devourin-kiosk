import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../components/CustomText';
import { useInitialDataFetch } from '../src/hooks/useInitialDataFetch';
import { theme } from '../src/styles/theme';

export default function ModeSelectionScreen() {
    const router = useRouter();
    const { callInitialSetUpAPIAsync, loading } = useInitialDataFetch();
    const [isConfigured, setIsConfigured] = useState(false);

    useEffect(() => {
        const initializeSystem = async () => {
            await callInitialSetUpAPIAsync();
            setIsConfigured(true);
        };
        initializeSystem();
    }, []);

    const handleSelectMode = (mode: string) => {
        // dispatch(setOrderType(mode)) - assuming order type logic handles this
        router.replace('/menu');
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
            {/* Full Background Layer - Positioned to the left but not clipped by a narrow container */}
            <View style={styles.backgroundLayer}>
                <Image
                    source={require('../assets/icons/landing_page_bg.jpg')}
                    style={styles.bgImage}
                    resizeMode="cover"
                />
            </View>

            {/* Main Content Layer - Centered over the background */}
            <SafeAreaView style={styles.contentLayer}>
                {/* Restaurant Logo */}
                <View style={styles.logoContainer}>
                    <Image
                        source={require('../assets/icons/sihi_logo.png')}
                        style={styles.restaurantLogo}
                        resizeMode="contain"
                    />
                </View>

                {/* Center Group (Question + Buttons) */}
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
                        <Pressable
                            style={styles.modeButton}
                            onPress={() => handleSelectMode('Dinein')}
                        >
                            <View style={styles.iconWrapper}>
                                <MaterialCommunityIcons name="silverware-fork-knife" size={120} color="#fff" />
                            </View>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXX} color="#fff">
                                Dine-In
                            </CustomText>
                        </Pressable>

                        <Pressable
                            style={styles.modeButton}
                            onPress={() => handleSelectMode('Takeaway')}
                        >
                            <View style={styles.iconWrapper}>
                                <Ionicons name="bag-handle" size={120} color="#fff" />
                            </View>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXX} color="#fff">
                                Takeaway
                            </CustomText>
                        </Pressable>
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
        width: '35%', // Allows the food strip to be prominent but absolute
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
        marginTop: theme.spacing.xl,
        width: '70%',
        height: 200,
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
        height: 380,
        backgroundColor: '#D13C25',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
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
