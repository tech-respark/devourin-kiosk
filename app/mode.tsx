import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';
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
        // You could dispatch(setOrderType(mode)) here before routing
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXXXX} style={styles.title}>
                    Where will you be eating?
                </CustomText>
            </View>

            <View style={styles.optionsContainer}>
                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.optionCard}
                    onPress={() => handleSelectMode('Dinein')}
                >
                    <CustomText style={styles.icon}>🍽️</CustomText>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXX} style={styles.optionText}>
                        Dine-In
                    </CustomText>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.optionCard}
                    onPress={() => handleSelectMode('Takeaway')}
                >
                    <CustomText style={styles.icon}>🛍️</CustomText>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXX} style={styles.optionText}>
                        Takeaway
                    </CustomText>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: '#F8FAFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: theme.spacing.md,
        color: theme.colors.grayDark,
    },
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    header: {
        flex: 0.3,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    title: {
        textAlign: 'center',
        color: theme.colors.text,
    },
    optionsContainer: {
        flex: 0.5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xxl,
        gap: theme.spacing.xl,
    },
    optionCard: {
        flex: 1,
        maxWidth: 400,
        aspectRatio: 1,
        backgroundColor: theme.colors.white,
        borderRadius: theme.border.xxl,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 8,
    },
    icon: {
        fontSize: 80,
        marginBottom: theme.spacing.lg,
    },
    optionText: {
        color: theme.colors.text,
    }
});
