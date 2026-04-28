import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { theme } from '../src/styles/theme';
import CustomText from './CustomText';

interface ItemCardProps {
    name: string;
    price: number;
    currency?: string;
    isVeg: boolean;
    imageColor?: string;
    imageUrl?: string | null;
    quantity?: number;
    hasAddOnOrPortions?: boolean;
    onAdd: () => void;
    onRemove?: () => void;
    onOpenModal?: () => void;
    maxWidth?: any;
}

export const ItemCard: React.FC<ItemCardProps> = ({
    name,
    price,
    currency = '₹',
    isVeg,
    imageColor = theme.colors.theme_light2,
    imageUrl,
    quantity = 0,
    hasAddOnOrPortions = false,
    onAdd,
    onRemove,
    onOpenModal,
    maxWidth,
}) => {
    // If item has addons/portions, pressing the card opens the modal
    const handleAddPress = () => {
        if (hasAddOnOrPortions) {
            onOpenModal?.();
        } else {
            onAdd();
        }
    };

    // Pressing + when already in cart: if has addons/portions → open modal again,
    // otherwise just increment
    const handleIncrement = () => {
        if (hasAddOnOrPortions) {
            onOpenModal?.();
        } else {
            onAdd();
        }
    };

    return (
        <View style={[styles.cardContainer, { maxWidth: maxWidth || '100%' }]}>
            <TouchableOpacity activeOpacity={0.85} onPress={handleAddPress} style={styles.imageWrapper}>
                <View style={[styles.imagePlaceholder, { backgroundColor: imageColor }]}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.actualImage} resizeMode="cover" />
                    ) : (
                        <Ionicons name='fast-food-outline' size={60} color={theme.colors.theme} />
                    )}
                </View>
                {hasAddOnOrPortions && (
                    <View style={styles.customisableBadge}>
                        <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.xsmall} color={theme.colors.theme}>
                            Customisable
                        </CustomText>
                    </View>
                )}
            </TouchableOpacity>

            <View style={styles.contentContainer}>
                <View style={styles.infoWrapper}>
                    <View style={styles.titleRow}>
                        <CustomText
                            fontFamily={theme.fonts.SemiBold}
                            fontSize={theme.fontSize.medium}
                            color={theme.colors.text}
                            style={styles.titleText}
                            numberOfLines={2}
                        >
                            {name}
                        </CustomText>
                        <View style={[styles.vegSquare, { borderColor: isVeg ? theme.colors.success : theme.colors.error }]}>
                            <View style={[styles.vegCircle, { backgroundColor: isVeg ? theme.colors.success : theme.colors.error }]} />
                        </View>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color={theme.colors.black}>
                        {currency}{price.toFixed(0)}
                    </CustomText>

                    {quantity > 0 ? (
                        <LinearGradient style={styles.quantityContainer} colors={['#DD7E33', '#D95C20']}>
                            <TouchableOpacity activeOpacity={0.7} onPress={onRemove} style={styles.qtyButton}>
                                <Ionicons name="remove" size={18} color={theme.colors.white} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                activeOpacity={hasAddOnOrPortions ? 0.7 : 1}
                                onPress={hasAddOnOrPortions ? onOpenModal : undefined}
                                style={styles.qtyLabel}
                            >
                                <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.medium} color={theme.colors.white}>
                                    {quantity}
                                </CustomText>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.7} onPress={handleIncrement} style={styles.qtyButton}>
                                <Ionicons name="add" size={18} color={theme.colors.white} />
                            </TouchableOpacity>
                        </LinearGradient>
                    ) : (
                        <TouchableOpacity activeOpacity={0.7} onPress={handleAddPress} style={styles.addButton}>
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
        boxShadow: '0 1px 2px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        marginBottom: theme.spacing.md,
        minHeight: 280,
    },
    imageWrapper: {
        position: 'relative',
    },
    imagePlaceholder: {
        height: 140,
        borderRadius: theme.border.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
        overflow: 'hidden',
    },
    actualImage: {
        width: '100%',
        height: '100%',
    },
    customisableBadge: {
        position: 'absolute',
        bottom: theme.spacing.md + 4,
        left: 6,
        backgroundColor: theme.colors.theme_light2,
        borderRadius: theme.border.full,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
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
        borderColor: theme.colors.theme,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: theme.border.sm,
        overflow: 'hidden',
        width: 100,
        height: 44,
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
    },
});
