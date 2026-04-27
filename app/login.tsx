import { IP_ADDRESS } from '@/constants/Constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import CustomText from '../components/CustomText';
import { setBranchId, setDbName } from '../src/store/userSlice';
import { theme } from '../src/styles/theme';
import { makeAPIRequest } from '../src/utils/Helper';

const LogoImage = require('../assets/icons/app_icon.png');
const LogoWithText = require('../assets/icons/logo.png');

export default function LoginScreen() {
    const dispatch = useDispatch();
    const router = useRouter();

    const [restaurantName, setRestaurantName] = useState('plural4');
    const [passcode, setPasscode] = useState('123456');
    const [loading, setLoading] = useState(false);

    const handleLoginPress = async () => {
        if (!restaurantName || !passcode) {
            Toast.show({ type: "warning", text1: "Please fill all fields" });
            return;
        }
        setLoading(true);
        const baseUrl = `http://${IP_ADDRESS}:8080/nebula-services-1.6/${restaurantName.trim().toLowerCase()}/`;
        try {
            const headers: RequestInit = { headers: { "Content-Type": "application/json", app: restaurantName.trim().toLowerCase() } };
            const branchDetailsResponse = await makeAPIRequest(baseUrl + 'getBranchDetails', null, "GET", headers, "Invalid Configuration", true);
            if (branchDetailsResponse && branchDetailsResponse.branches?.length > 0) {
                const branchId = branchDetailsResponse.branches[0].branchId;
                dispatch(setDbName(restaurantName));
                dispatch(setBranchId(branchId.toString()));
                Toast.show({ type: "success", text1: 'Device Configured Successfully' });
                router.replace('/mode');
            }
        } catch (error) {
            Toast.show({ type: "error", text1: "Connection Failed" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Background Decorative Circles */}
            <View style={styles.bgCircleBlue} />
            <View style={styles.bgCircleYellow} />
            <View style={styles.bgCircleMint} />
            <Image source={LogoImage} style={styles.bgLogoHalf} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>

                <View style={styles.logoHeader}>
                    <Image source={LogoWithText} style={styles.logoIcon} />
                </View>

                <View style={styles.formContainer}>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXXX} style={styles.title}>
                        System Setup
                    </CustomText>
                    <CustomText color={theme.colors.grayDark} fontSize={theme.fontSize.medium} style={styles.subtitle}>
                        Configure your kiosk terminal
                    </CustomText>

                    <View style={styles.inputWrapper}>
                        <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.small} style={styles.label}>
                            Restaurant Name
                        </CustomText>
                        <TextInput
                            style={styles.input}
                            value={restaurantName}
                            onChangeText={setRestaurantName}
                            placeholder="e.g. plural"
                            placeholderTextColor={theme.colors.light_gray}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputWrapper}>
                        <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.small} style={styles.label}>
                            Password
                        </CustomText>
                        <TextInput
                            style={styles.input}
                            value={passcode}
                            onChangeText={setPasscode}
                            placeholder="••••••"
                            placeholderTextColor={theme.colors.light_gray}
                            keyboardType="number-pad"
                            secureTextEntry
                            maxLength={6}
                        />
                    </View>

                    <TouchableOpacity activeOpacity={0.8} onPress={handleLoginPress} disabled={loading}>
                        <LinearGradient
                            colors={['#DD7E33', '#D95C20']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.loginBtnGrad}
                        >
                            {loading ? (
                                <ActivityIndicator color={theme.colors.white} />
                            ) : (
                                <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.heading} color={theme.colors.white}>
                                    Configure and Login
                                </CustomText>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <CustomText color={theme.colors.grayDark} fontSize={theme.fontSize.small} style={styles.footerText}>
                        By continuing, you agree to our{' '}
                        <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.small} style={styles.linkText}>
                            Terms of Service
                        </CustomText>
                        {' '}and{' '}
                        <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.small} style={styles.linkText}>
                            Privacy Policy
                        </CustomText>
                    </CustomText>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.white,
    },
    bgCircleBlue: {
        position: 'absolute',
        top: -theme.device.width * 0.2,
        left: -theme.device.width * 0.1,
        width: theme.device.width * 0.6,
        height: theme.device.width * 0.6,
        borderRadius: theme.device.width * 0.4,
        backgroundColor: '#EBF2FF',
        opacity: 0.8,
    },
    bgCircleYellow: {
        position: 'absolute',
        top: theme.device.height * 0.4,
        right: -theme.device.width * 0.3,
        width: theme.device.width * 0.55,
        height: theme.device.width * 0.55,
        borderRadius: theme.device.width * 0.3,
        backgroundColor: '#FEF7EB',
        opacity: 0.8,
    },
    bgCircleMint: {
        position: 'absolute',
        bottom: -theme.device.height * 0.1,
        left: -theme.device.width * 0.1,
        width: theme.device.width * 0.6,
        height: theme.device.width * 0.6,
        borderRadius: theme.device.width * 0.3,
        backgroundColor: '#EBFBF5',
        opacity: 0.8,
    },
    bgLogoHalf: {
        position: 'absolute',
        width: theme.device.width * 0.6,
        height: theme.device.width * 0.6,
        top: theme.device.height * 0.05,
        right: -theme.device.width * 0.3,
        opacity: 0.1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        padding: theme.spacing.lg,
        justifyContent: 'space-between',
    },
    logoHeader: {
        marginTop: theme.device.height * 0.06,
    },
    logoIcon: {
        width: theme.device.width * 0.5,
        height: 120,
        resizeMode: 'contain',
    },
    formContainer: {
        width: '100%',
        maxWidth: 450,
        backgroundColor: theme.colors.white,
        padding: theme.spacing.xl,
        borderRadius: theme.border.xl,
        boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.2)'
    },
    title: {
        marginBottom: theme.spacing.xs,
        textAlign: 'center',
    },
    subtitle: {
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
    },
    inputWrapper: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        marginBottom: theme.spacing.sm,
        marginLeft: theme.spacing.xs,
    },
    input: {
        backgroundColor: '#F3F6FB',
        borderRadius: theme.border.lg,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.medium,
        color: theme.colors.text,
    },
    loginBtnGrad: {
        paddingVertical: theme.spacing.md,
        borderRadius: theme.border.lg,
        alignItems: 'center',
        marginTop: theme.spacing.md,
    },
    footer: {
        marginBottom: theme.spacing.lg,
        paddingHorizontal: theme.spacing.lg,
    },
    footerText: {
        textAlign: 'center',
        lineHeight: 20,
    },
    linkText: {
        textDecorationLine: 'underline',
        color: theme.colors.text,
    },
});
