import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { BackHandler, Modal, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '../../components/CustomText';
import { theme } from '../../src/styles/theme';

export default function ModuleSelectionScreen() {
    const router = useRouter();

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);

        if (Platform.OS === 'web') {
            window.history.pushState(null, '', window.location.href);
            window.onpopstate = () => {
                window.history.pushState(null, '', window.location.href);
            };
        }

        return () => {
            backHandler.remove();
            if (Platform.OS === 'web') {
                window.onpopstate = null;
            }
        };
    }, []);

    const requestFullscreen = () => {
        if (Platform.OS === 'web' && document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen().catch(() => {
                console.log('Fullscreen request blocked/failed');
            });
        }
    };

    const handleModuleSelect = (module: 'kiosk' | 'order-tracking') => {
        requestFullscreen();
        router.replace((module === 'kiosk' ? '/kiosk' : '/order-tracking') as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Image
                source={require('../../assets/icons/landing_page_bg.jpg')}
                style={styles.backgroundImage}
                contentFit="cover"
            />
            <View style={styles.scrim} />

            <Modal visible transparent animationType="fade" onRequestClose={() => {}}>
                <View style={styles.modalBackdrop}>
                    <View style={styles.dialog}>
                        <Image
                            source={require('../../assets/icons/logo.png')}
                            style={styles.logo}
                            contentFit="contain"
                        />
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXX} style={styles.title}>
                            Choose Module
                        </CustomText>
                        <CustomText fontSize={theme.fontSize.medium} color="#5F6B7A" style={styles.subtitle}>
                            Select how this device will be used.
                        </CustomText>

                        <View style={styles.options}>
                            <Pressable style={styles.optionButton} onPress={() => handleModuleSelect('kiosk')}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="fast-food-outline" size={34} color="#D95C20" />
                                </View>
                                <View style={styles.optionText}>
                                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingX} color="#162640">
                                        Kiosk
                                    </CustomText>
                                    <CustomText fontSize={theme.fontSize.medium} color="#667085" style={styles.optionDescription}>
                                        Customer self-ordering flow
                                    </CustomText>
                                </View>
                                <Ionicons name="chevron-forward" size={26} color="#98A2B3" />
                            </Pressable>

                            <Pressable style={styles.optionButton} onPress={() => handleModuleSelect('order-tracking')}>
                                <View style={styles.iconCircle}>
                                    <Ionicons name="receipt-outline" size={34} color="#D95C20" />
                                </View>
                                <View style={styles.optionText}>
                                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingX} color="#162640">
                                        Order Tracking Service
                                    </CustomText>
                                    <CustomText fontSize={theme.fontSize.medium} color="#667085" style={styles.optionDescription}>
                                        Display live kitchen order status
                                    </CustomText>
                                </View>
                                <Ionicons name="chevron-forward" size={26} color="#98A2B3" />
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101828',
    },
    backgroundImage: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.22,
    },
    scrim: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(16, 24, 40, 0.62)',
    },
    modalBackdrop: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        backgroundColor: 'rgba(16, 24, 40, 0.35)',
    },
    dialog: {
        width: '100%',
        maxWidth: 720,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        padding: 36,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 18 },
        shadowOpacity: 0.18,
        shadowRadius: 28,
        elevation: 14,
    },
    logo: {
        width: 220,
        height: 76,
        alignSelf: 'center',
        marginBottom: 16,
    },
    title: {
        textAlign: 'center',
        color: '#162640',
    },
    subtitle: {
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 28,
    },
    options: {
        gap: 16,
    },
    optionButton: {
        minHeight: 118,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#E4E7EC',
        backgroundColor: '#F9FAFB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 22,
        paddingVertical: 18,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FFF2E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 18,
    },
    optionText: {
        flex: 1,
        minWidth: 0,
    },
    optionDescription: {
        marginTop: 8,
    },
});
