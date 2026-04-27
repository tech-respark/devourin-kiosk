import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme } from '../src/styles/theme';
import CustomText from './CustomText';

interface ItemCardProps {
    name: string;
    price: number;
    isVeg: boolean;
    imageColor?: string; // used for placeholder tint
    quantity?: number;
    onAdd: () => void;
    onRemove?: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
    name,
    price,
    isVeg,
    imageColor = theme.colors.theme_light2,
    quantity = 0,
    onAdd,
    onRemove
}) => {
    return (
        <View style={styles.cardContainer}>
            <View style={[styles.imagePlaceholder, { backgroundColor: imageColor }]}>
                <Ionicons name='fast-food-outline' size={60} color={theme.colors.theme} />
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.infoWrapper}>
                    <View style={styles.titleRow}>
                        <CustomText fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.medium} color={theme.colors.text} style={styles.titleText} numberOfLines={2}>
                            {name}
                        </CustomText>
                        <View style={[styles.vegSquare, { borderColor: isVeg ? theme.colors.success : theme.colors.theme }]}>
                            <View style={[styles.vegCircle, { backgroundColor: isVeg ? theme.colors.success : theme.colors.theme }]} />
                        </View>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color={theme.colors.black}>
                        ₹{price.toFixed(1)}
                    </CustomText>

                    {quantity > 0 ? (
                        <LinearGradient style={styles.quantityContainer} colors={['#DD7E33', '#D95C20']}>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={onRemove}
                                style={styles.qtyButton}
                            >
                                <Ionicons name="remove" size={20} color={theme.colors.white} />
                            </TouchableOpacity>
                            <View style={styles.qtyLabel}>
                                <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.medium} color={theme.colors.white}>
                                    {quantity}
                                </CustomText>
                            </View>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={onAdd}
                                style={styles.qtyButton}
                            >
                                <Ionicons name="add" size={20} color={theme.colors.white} />
                            </TouchableOpacity>
                        </LinearGradient>
                    ) : (
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={onAdd}
                            style={styles.addButton}
                        >
                            <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} color={theme.colors.theme}>
                                + Add
                            </CustomText>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        flex: 1,
        backgroundColor: theme.colors.white,
        borderRadius: theme.border.sm,
        padding: theme.spacing.md,
        shadowColor: "#000",
        boxShadow: "0 1px 2px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        marginBottom: theme.spacing.md,
        minHeight: 280, // Ensure cards have a consistent minimum height
    },
    imagePlaceholder: {
        height: 140,
        borderRadius: theme.border.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    infoWrapper: {
        marginBottom: theme.spacing.sm,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    titleText: {
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    vegSquare: {
        width: 18,
        height: 18,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
    },
    vegCircle: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing.sm,
    },
    addButton: {
        borderRadius: theme.border.sm,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
        backgroundColor: theme.colors.theme_light,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: theme.colors.theme
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F6FB',
        borderRadius: theme.border.sm,
        overflow: 'hidden',
        width: 100,
        height: 48,
    },
    qtyButton: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyLabel: {
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'center',
    }
});
