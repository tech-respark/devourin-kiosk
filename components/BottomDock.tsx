import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme } from '../src/styles/theme';
import CustomText from './CustomText';

interface BottomDockProps {
    itemCount: number;
    subTotal: number;
    onCancel: () => void;
    onProceed: () => void;
    proceedText?: string;
}

export const BottomDock: React.FC<BottomDockProps> = ({
    itemCount,
    subTotal,
    onCancel,
    onProceed,
    proceedText = "Proceed"
}) => {
    return (
        <View style={styles.container}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xl }}>
                <View style={styles.cartInfoSection}>
                    <View style={styles.cartIconContainer}>
                        <Feather name="shopping-cart" size={theme.fontSize.headingXX} color={theme.colors.theme} />
                        {itemCount > 0 && (
                            <View style={styles.badge}>
                                <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.xsmall} color={theme.colors.white}>
                                    {itemCount}
                                </CustomText>
                            </View>
                        )}
                    </View>
                    <View style={styles.takeOutInfo}>
                        <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.regular} color={theme.colors.theme}>
                            Added to Cart
                        </CustomText>
                        <CustomText fontSize={theme.fontSize.small} color={theme.colors.grayDark}>
                            {itemCount} Item(s)
                        </CustomText>
                    </View>
                </View>

                <View style={styles.totalSection}>
                    <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.small} color={theme.colors.grayDark}>
                        Sub Total
                    </CustomText>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingX} color={theme.colors.black}>
                        ₹{subTotal.toFixed(1)}
                    </CustomText>
                </View>
            </View>

            <View style={styles.actionsSection}>
                <TouchableOpacity activeOpacity={0.7} style={styles.cancelBtn} onPress={onCancel}>
                    <CustomText fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.medium} color={theme.colors.grayDark}>
                        Cancel Order
                    </CustomText>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.8} onPress={onProceed}>
                    <LinearGradient
                        colors={['#DD7E33', '#D95C20']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.proceedBtn}
                    >
                        <Ionicons name='checkmark-circle-outline' size={theme.fontSize.headingXX} color={theme.colors.white} />
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color={theme.colors.white}>
                            {proceedText}
                        </CustomText>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.white,
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        boxShadow: '0px -10px 20px 0px rgba(0, 0, 0, 0.05)',

    },
    cartInfoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FCF1E4',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.border.md,
    },
    cartIconContainer: {
        position: 'relative',
        marginRight: theme.spacing.sm,
    },
    cartIconText: {
        fontSize: 28,
    },
    badge: {
        position: 'absolute',
        top: -10,
        right: -10,
        backgroundColor: theme.colors.theme,
        borderRadius: theme.border.full,
        minWidth: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FCF1E4',
    },
    takeOutInfo: {
        flexDirection: 'column',
    },
    totalSection: {
        alignItems: 'flex-start',
    },
    actionsSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    cancelBtn: {
        borderWidth: 1,
        borderColor: theme.colors.light_gray,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.border.md,
        height: 60,
        justifyContent: 'center',
    },
    proceedBtn: {
        backgroundColor: theme.colors.theme,
        height: 60,
        paddingHorizontal: theme.spacing.lg,
        borderRadius: theme.border.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.sm,
    },
});
