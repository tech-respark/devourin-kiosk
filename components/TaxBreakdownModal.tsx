import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme } from '../src/styles/theme';
import { useAppSelector } from '../src/store/hooks';
import { selectApplicationConfigs, selectMobileSettings } from '../src/store/userSlice';
import { calculateCartTotals } from '../src/utils/taxCalculation';
import CustomText from './CustomText';

interface TaxBreakdownModalProps {
    visible: boolean;
    onClose: () => void;
    cartItems: any[];
}

export const TaxBreakdownModal: React.FC<TaxBreakdownModalProps> = ({ visible, onClose, cartItems }) => {
    const mobileSettings = useAppSelector(selectMobileSettings);
    const applicationConfigs = useAppSelector(selectApplicationConfigs);
    const currency = mobileSettings?.['currency_symbol'] || '₹';

    const data = calculateCartTotals(cartItems, applicationConfigs);

    const breakdown = {
        subtotal: data.subtotal,
        cgst: data.taxBreakdown.cgst,
        sgst: data.taxBreakdown.sgst,
        igst: data.taxBreakdown.igst,
        vat: data.taxBreakdown.vat,
        total: data.grandTotal
    };

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
                            <CustomText fontFamily={theme.fonts.SemiBold}>{currency}{breakdown.subtotal.toFixed(2)}</CustomText>
                        </View>
 
                        {breakdown.cgst > 0 && (
                            <View style={styles.row}>
                                <CustomText color="#666">CGST {data.isReverseCalculation ? '(Incl.)' : ''}</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium}>{currency}{breakdown.cgst.toFixed(2)}</CustomText>
                            </View>
                        )}
                        {breakdown.sgst > 0 && (
                            <View style={styles.row}>
                                <CustomText color="#666">SGST {data.isReverseCalculation ? '(Incl.)' : ''}</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium}>{currency}{breakdown.sgst.toFixed(2)}</CustomText>
                            </View>
                        )}
                        {breakdown.igst > 0 && (
                            <View style={styles.row}>
                                <CustomText color="#666">IGST {data.isReverseCalculation ? '(Incl.)' : ''}</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium}>{currency}{breakdown.igst.toFixed(2)}</CustomText>
                            </View>
                        )}
                        {breakdown.vat > 0 && (
                            <View style={styles.row}>
                                <CustomText color="#666">VAT {data.isReverseCalculation ? '(Incl.)' : ''}</CustomText>
                                <CustomText fontFamily={theme.fonts.Medium}>{currency}{breakdown.vat.toFixed(2)}</CustomText>
                            </View>
                        )}
 
                        <View style={[styles.row, styles.totalRow]}>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large}>Total Payable</CustomText>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color={theme.colors.theme}>{currency}{breakdown.total.toFixed(2)}</CustomText>
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
