import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme } from '../src/styles/theme';
import { useAppSelector } from '../src/store/hooks';
import { selectMobileSettings } from '../src/store/userSlice';
import CustomText from './CustomText';

interface TaxBreakdownModalProps {
    visible: boolean;
    onClose: () => void;
    cartItems: any[];
}

export const TaxBreakdownModal: React.FC<TaxBreakdownModalProps> = ({ visible, onClose, cartItems }) => {
    const mobileSettings = useAppSelector(selectMobileSettings);
    const currency = mobileSettings?.['currency_symbol'] || '₹';

    const calculateBreakdown = () => {
        let subtotal = 0;
        let cgst = 0;
        let sgst = 0;
        let igst = 0;
        let vat = 0;
        let sc = 0;

        cartItems.forEach(item => {
            const itemBase = item.price * item.quantity;
            subtotal += itemBase;
            cgst += (itemBase * (item.cgst || 0)) / 100;
            sgst += (itemBase * (item.sgst || 0)) / 100;
            igst += (itemBase * (item.igst || 0)) / 100;
            vat += (itemBase * (item.vat || 0)) / 100;

            (item.addOns || []).forEach((addon: any) => {
                const addonBase = addon.price * addon.quantity;
                subtotal += addonBase;
                cgst += (addonBase * (addon.cgst || 0)) / 100;
                sgst += (addonBase * (addon.sgst || 0)) / 100;
                igst += (addonBase * (addon.igst || 0)) / 100;
                vat += (addonBase * (addon.vat || 0)) / 100;
            });
        });

        const total = subtotal + cgst + sgst + igst + vat;

        return { subtotal, cgst, sgst, igst, vat, total };
    };

    const data = calculateBreakdown();

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading}>Order Summary</CustomText>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.row}>
                            <CustomText color="#666">Item Subtotal</CustomText>
                            <CustomText fontFamily={theme.fonts.SemiBold}>{currency}{data.subtotal.toFixed(2)}</CustomText>
                        </View>

                        {data.cgst > 0 && (
                            <View style={styles.row}>
                                <CustomText color="#666">CGST</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium}>{currency}{data.cgst.toFixed(2)}</CustomText>
                            </View>
                        )}
                        {data.sgst > 0 && (
                            <View style={styles.row}>
                                <CustomText color="#666">SGST</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium}>{currency}{data.sgst.toFixed(2)}</CustomText>
                            </View>
                        )}
                        {data.igst > 0 && (
                            <View style={styles.row}>
                                <CustomText color="#666">IGST</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium}>{currency}{data.igst.toFixed(2)}</CustomText>
                            </View>
                        )}
                        {data.vat > 0 && (
                            <View style={styles.row}>
                                <CustomText color="#666">VAT</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium}>{currency}{data.vat.toFixed(2)}</CustomText>
                            </View>
                        )}

                        <View style={[styles.row, styles.totalRow]}>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large}>Total Payable</CustomText>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color={theme.colors.theme}>{currency}{data.total.toFixed(2)}</CustomText>
                        </View>
                    </ScrollView>

                    <TouchableOpacity onPress={onClose} >
                        <LinearGradient style={styles.closeBtn} colors={['#DD7E33', '#D95C20']}>
                            <CustomText fontFamily={theme.fonts.Bold} color="#fff">Got it</CustomText>

                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    content: {
        width: '90%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 24,
        maxHeight: '80%',
        shadowColor: "#000",
        ...(Platform.OS === 'web' ? {
            boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.2)'
        } : {
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
        }),
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    totalRow: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0'
    },
    closeBtn: {
        backgroundColor: theme.colors.theme,
        height: 55,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20
    }
});
