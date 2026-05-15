import { OTA_VERSION } from '@/constants/Constants';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useDispatch } from 'react-redux';
import CustomText from '../components/CustomText';
import { setBranchId, setDbName, setIpAddress, setTaxes } from '../src/store/userSlice';
import { resetMenu } from '../src/store/menuSlice';
import { theme } from '../src/styles/theme';
import { checkBranchValidity, makeAPIRequest } from '../src/utils/Helper';

const LogoImage = require('../assets/icons/app_icon.png');
const LogoWithText = require('../assets/icons/logo.png');

interface Branch {
    branchId: number;
    branch: string;
}

export default function LoginScreen() {
    const dispatch = useDispatch();
    const router = useRouter();

    const [domain, setDomain] = useState('');
    const [restaurantName, setRestaurantName] = useState('');
    const [loading, setLoading] = useState(false);

    // Branch Selection
    const [branchSelectionView, setBranchSelectionView] = useState(false);
    const [branchOptions, setBranchOptions] = useState<Branch[]>([]);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

    const inputRefs = {
        domain: useRef<TextInput>(null),
        dbName: useRef<TextInput>(null),
    };

    useEffect(() => {
        // Auto-focus first input
        setTimeout(() => inputRefs.domain.current?.focus(), 100);
    }, []);

    const handleLoginPress = async () => {
        if (!domain || !restaurantName) {
            Toast.show({ type: "error", text1: "Please enter valid Domain and Restaurant Name" });
            return;
        }
        setLoading(true);
        const dbName = restaurantName.trim().toLowerCase();
        const baseDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '');
        const baseUrl = `https://${baseDomain}/nebula-services-1.6/${dbName}/`;

        try {
            const headers = { headers: { "Content-Type": "application/json", app: dbName } };
            const response = await makeAPIRequest(baseUrl + 'getBranchDetails', null, "GET", headers, "Invalid Configuration", true);

            if (response) {
                const domainOrIp = response.applicationDomain || baseDomain;
                dispatch(resetMenu());
                dispatch(setDbName(dbName));
                dispatch(setIpAddress(domainOrIp));
                dispatch(setTaxes(response.taxes));

                if (response.branches?.length > 1) {
                    setBranchOptions(response.branches);
                    setBranchSelectionView(true);
                } else if (response.branches?.length === 1) {
                    const branch = response.branches[0];
                    if (await checkBranchValidity(baseUrl, branch.branchId)) {
                        dispatch(setBranchId(branch.branchId.toString()));
                        Toast.show({ type: "success", text1: 'Device Configured Successfully' });
                        router.replace('/module-selection' as any);
                    }
                } else {
                    Toast.show({ type: "error", text1: "No branches found for this account" });
                }
            }
        } catch (error) {
            Toast.show({ type: "error", text1: "Connection Failed" });
        } finally {
            setLoading(false);
        }
    };

    const handleBranchSubmit = async () => {
        if (!selectedBranch) {
            Toast.show({ type: "error", text1: "Please select a branch" });
            return;
        }

        const baseDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '');
        const dbName = restaurantName.trim().toLowerCase();
        const baseUrl = `https://${baseDomain}/nebula-services-1.6/${dbName}/`;

        if (await checkBranchValidity(baseUrl, selectedBranch.branchId)) {
            dispatch(setBranchId(selectedBranch.branchId.toString()));
            router.replace('/module-selection' as any);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Background Decorations */}
            <View style={styles.bgCircleBlue} />
            <View style={styles.bgCircleYellow} />
            <View style={styles.bgCircleMint} />
            <Image source={LogoImage} style={styles.bgLogoHalf} />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    <View style={styles.logoHeader}>
                        <Image source={LogoWithText} style={styles.logoIcon} />
                    </View>

                    <View style={styles.formContainer}>
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXXX} style={styles.title}>
                            System Setup
                        </CustomText>
                        <CustomText color={theme.colors.grayDark} fontSize={theme.fontSize.medium} style={styles.subtitle}>
                            Configure your terminal endpoint
                        </CustomText>

                        {branchSelectionView ? (
                            /* Branch Selection View */
                            <View style={styles.branchContainer}>
                                <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} style={styles.label}>
                                    Select Restaurant Branch
                                </CustomText>
                                <Dropdown
                                    style={styles.dropdown}
                                    placeholderStyle={[styles.dropdownText, { color: 'lightgray' }]}
                                    selectedTextStyle={styles.dropdownText}
                                    data={branchOptions.map(b => ({ label: b.branch, value: b.branchId }))}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Choose your branch"
                                    value={selectedBranch?.branchId}
                                    onChange={item => {
                                        const branch = branchOptions.find(b => b.branchId === item.value);
                                        setSelectedBranch(branch || null);
                                    }}
                                    renderRightIcon={() => (
                                        <Ionicons name="chevron-down" size={20} color={theme.colors.text} />
                                    )}
                                />
                                <TouchableOpacity activeOpacity={0.8} onPress={handleBranchSubmit} style={styles.actionBtnWrapper}>
                                    <LinearGradient colors={['#DD7E33', '#D95C20']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginBtnGrad}>
                                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color="#fff">
                                            Confirm Branch
                                        </CustomText>
                                    </LinearGradient>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setBranchSelectionView(false)} style={styles.backLink}>
                                    <CustomText color={theme.colors.grayDark}>Back to Setup</CustomText>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            /* Domain and Name View */
                            <View>
                                <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} style={styles.label}>
                                    Domain Name
                                </CustomText>
                                <TextInput
                                    ref={inputRefs.domain}
                                    style={styles.dbInput}
                                    value={domain}
                                    onChangeText={setDomain}
                                    placeholder="e.g. dev.godirekt.in"
                                    autoCapitalize="none"
                                    placeholderTextColor={'lightgray'}
                                    returnKeyType="next"
                                    onSubmitEditing={() => inputRefs.dbName.current?.focus()}
                                />

                                <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} style={[styles.label, { marginTop: 20 }]}>
                                    Restaurant Name
                                </CustomText>
                                <TextInput
                                    ref={inputRefs.dbName}
                                    style={styles.dbInput}
                                    value={restaurantName}
                                    onChangeText={setRestaurantName}
                                    placeholder="e.g. delicious_bistro"
                                    autoCapitalize="none"
                                    placeholderTextColor={'lightgray'}
                                />

                                <TouchableOpacity activeOpacity={0.8} onPress={handleLoginPress} disabled={loading} style={styles.actionBtnWrapper}>
                                    <LinearGradient colors={['#DD7E33', '#D95C20']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginBtnGrad}>
                                        {loading ? <ActivityIndicator color="#fff" /> : (
                                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color="#fff">
                                                Configure and Login
                                            </CustomText>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    <View style={styles.footer}>
                        <CustomText color={theme.colors.grayDark} fontSize={theme.fontSize.small} style={styles.footerText}>
                            Devourin Kiosk v{Constants.expoConfig?.version}_{OTA_VERSION}
                        </CustomText>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFF',
    },
    bgCircleBlue: {
        position: 'absolute',
        top: -100,
        left: -100,
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: '#EBF2FF',
        opacity: 0.8,
    },
    bgCircleYellow: {
        position: 'absolute',
        bottom: -50,
        right: -50,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#FEF7EB',
        opacity: 0.8,
    },
    bgCircleMint: {
        position: 'absolute',
        bottom: theme.device.height * 0.15,
        left: -75,
        width: 300,
        height: 300,
        borderRadius: 150,
        backgroundColor: '#EBFBF5',
        opacity: 0.8
    },
    bgLogoHalf: {
        position: 'absolute',
        width: 400,
        height: 400,
        top: 100,
        right: -200,
        opacity: 0.1,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
        paddingTop: theme.device.height * 0.05,
    },
    logoHeader: {
        marginBottom: theme.spacing.xxl,
    },
    logoIcon: {
        width: theme.device.width * 0.6,
        height: 120,
        resizeMode: 'contain',
    },
    formContainer: {
        width: '100%',
        maxWidth: 550,
        backgroundColor: '#fff',
        padding: theme.spacing.xxl,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        textAlign: 'center',
        marginBottom: 10,
        color: '#162640',
    },
    subtitle: {
        textAlign: 'center',
        marginBottom: 40,
    },
    label: {
        marginBottom: 15,
        color: '#162640',
    },
    dbInput: {
        backgroundColor: '#F3F6FB',
        borderRadius: 15,
        height: 65,
        paddingHorizontal: 20,
        fontSize: 18,
        fontFamily: 'Poppins-Medium',
        color: '#162640',
        borderWidth: 1,
        borderColor: '#EBF2FF',
    },
    actionBtnWrapper: {
        marginTop: 40,
    },
    loginBtnGrad: {
        height: 70,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#D95C20",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 15,
        elevation: 8,
    },
    branchContainer: {
        width: '100%',
    },
    dropdown: {
        height: 65,
        backgroundColor: '#F3F6FB',
        borderRadius: 15,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: '#EBF2FF',
    },
    dropdownText: {
        fontSize: 18,
        fontFamily: 'Poppins-Medium',
        color: '#162640',
    },
    backLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    footer: {
        marginTop: 40,
        marginBottom: 20,
    },
    footerText: {
        color: '#999',
    }
});
