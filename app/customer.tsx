import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { BottomDock } from '../components/BottomDock';
import CustomText from '../components/CustomText';
import { selectCartItems, selectCartSubtotal } from '../src/store/cartSlice';
import { setCustomerDetails } from '../src/store/userSlice';
import { theme } from '../src/styles/theme';

export default function CustomerDetails() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');

    const cartItems = useSelector(selectCartItems);
    const subTotal = useSelector(selectCartSubtotal);
    const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleConfirm = () => {
        if (name.trim()) {
            dispatch(setCustomerDetails({ name: name.trim(), mobile: mobile.trim() }));
        }
        router.push('/payment');
    };

    const handleSkip = () => {
        router.push('/payment');
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
                    <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium}>Back</CustomText>
                </TouchableOpacity>
                <Image source={require('../assets/icons/logo.png')} style={styles.devourinLogo} resizeMode="contain" />
                <View style={{ width: 100 }} />
            </View>

            <View style={styles.mainContent}>
                <Image source={require('../assets/icons/sihi_logo.png')} style={styles.sihiLogo} resizeMode="contain" />

                <View style={styles.formCard}>
                    <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.headingX} style={styles.formTitle}>
                        Enter Your Details To Place Your Order
                    </CustomText>

                    {/* Name Input */}
                    <View style={styles.inputWrapper}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="person-outline" size={24} color="#333" />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Your Name"
                            placeholderTextColor="#999"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    {/* Mobile Input */}
                    <View style={styles.inputWrapper}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="call-outline" size={24} color="#333" />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Mobile Number"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                            value={mobile}
                            onChangeText={setMobile}
                        />
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.btnRow}>
                        <TouchableOpacity style={styles.skipBtn} onPress={handleSkip}>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} color={theme.colors.grayDark}>
                                Skip
                            </CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} color="#fff">
                                Confirm
                            </CustomText>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <BottomDock itemCount={totalQty} subTotal={subTotal} onCancel={() => router.back()} hideProceed={true} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.border.md,
        gap: theme.spacing.xs,
    },
    devourinLogo: { width: 150, height: 40 },
    mainContent: { flex: 1, alignItems: 'center', paddingTop: theme.spacing.xxxl, backgroundColor: theme.colors.background },
    sihiLogo: { width: 300, height: 200, marginBottom: theme.spacing.xxxl },
    formCard: {
        width: '70%',
        backgroundColor: '#fff',
        borderRadius: theme.border.md,
        padding: theme.spacing.xxl,
        alignItems: 'center',
        boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.05)',
    },
    formTitle: { marginBottom: theme.spacing.xxl, color: '#162640', textAlign: 'center' },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        height: 70,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 15,
        marginBottom: theme.spacing.lg,
        paddingHorizontal: theme.spacing.md,
    },
    iconContainer: {
        width: 50,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#E0E0E0',
        marginRight: theme.spacing.md,
    },
    input: { flex: 1, fontSize: 20, fontFamily: 'Poppins-Medium', color: '#333' },
    btnRow: { flexDirection: 'row', width: '100%', gap: theme.spacing.lg, marginTop: theme.spacing.xl },
    skipBtn: {
        flex: 1,
        height: 70,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmBtn: {
        flex: 1,
        height: 70,
        backgroundColor: '#D13C25',
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
