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
    onAdd: () => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
    name,
    price,
    isVeg,
    imageColor = '#FCF1E4',
    onAdd
}) => {
    return (
        <View style={styles.cardContainer}>
            <View style={[styles.imagePlaceholder, { backgroundColor: imageColor }]}>
                <Ionicons name='fast-food-outline' size={60} color={theme.colors.theme} />
            </View>

            <View style={styles.contentContainer}>
                <View style={styles.titleRow}>
                    <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} color={theme.colors.text} style={styles.titleText} numberOfLines={2}>
                        {name}
                    </CustomText>
                    <View style={[styles.vegSquare, { borderColor: isVeg ? theme.colors.success : theme.colors.theme }]}>
                        <View style={[styles.vegCircle, { backgroundColor: isVeg ? theme.colors.success : theme.colors.theme }]} />
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: theme.spacing.md }}>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color={theme.colors.black}>
                        ₹{price.toFixed(1)}
                    </CustomText>
                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={onAdd}
                    >
                        <LinearGradient
                            colors={['#DD7E33', '#D95C20']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.addButton}
                        >
                            <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} color={theme.colors.white}>
                                + Add
                            </CustomText>
                        </LinearGradient>
                    </TouchableOpacity>
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
    },
    imagePlaceholder: {
        height: 140,
        borderRadius: theme.border.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: theme.spacing.md,
    },
    placeholderIcon: {
        fontSize: 48,
    },
    contentContainer: {
        flexDirection: 'column',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.sm,
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
    addButton: {
        borderRadius: theme.border.sm,
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        width: 100,
    }
});
