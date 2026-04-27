import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { BottomDock } from '../components/BottomDock';
import CustomText from '../components/CustomText';
import { removeFromCart, selectCartItems, selectCartSubtotal, selectGlobalInstruction, setGlobalInstruction, updateQuantity } from '../src/store/cartSlice';
import { theme } from '../src/styles/theme';

export default function MyOrderCart() {
    const dispatch = useDispatch();
    const router = useRouter();
    const cartItems = useSelector(selectCartItems);
    const subTotal = useSelector(selectCartSubtotal);
    const instruction = useSelector(selectGlobalInstruction);

    const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const updateQty = (id: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        dispatch(updateQuantity({ id, quantity: newQuantity }));
    };

    const removeItem = (id: string) => {
        dispatch(removeFromCart(id));
    };

    const renderCartItem = ({ item }: { item: any }) => (
        <View style={styles.cartItemCard}>
            {/* Item Image with placeholder icon */}
            <View style={[styles.itemImageContainer, { backgroundColor: item.imageColor || '#F3F6FB' }]}>
                <Ionicons name="fast-food-outline" size={50} color={theme.colors.theme} />
            </View>

            <View style={styles.itemDetails}>
                <View style={styles.itemHeader}>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} style={styles.itemName} numberOfLines={2}>
                        {item.name}
                    </CustomText>
                    <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
                        <Ionicons name="trash-outline" size={24} color={theme.colors.grayDark} />
                    </TouchableOpacity>
                </View>

                {item.size && (
                    <CustomText fontSize={theme.fontSize.small} color={theme.colors.grayDark} style={styles.itemSize}>
                        Size: {item.size}
                    </CustomText>
                )}

                <View style={styles.priceActionRow}>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} color={theme.colors.black}>
                        ₹{item.price.toFixed(1)}
                    </CustomText>

                    <View style={styles.qtyContainer}>
                        <TouchableOpacity
                            style={styles.qtyBtn}
                            onPress={() => updateQty(item.id, item.quantity - 1)}
                        >
                            <Ionicons name="remove" size={24} color={theme.colors.grayDark} />
                        </TouchableOpacity>

                        <View style={styles.qtyValueContainer}>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.medium}>
                                {item.quantity}
                            </CustomText>
                        </View>

                        <TouchableOpacity
                            onPress={() => updateQty(item.id, item.quantity + 1)}
                        >
                            <LinearGradient
                                colors={['#DD7E33', '#D95C20']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.qtyBtnPlus}
                            >
                                <Ionicons name="add" size={24} color={theme.colors.white} />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'top']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={20} color={theme.colors.text} />
                    <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium}>Back</CustomText>
                </TouchableOpacity>

                <View style={styles.headerTitleRow}>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingX} style={styles.headerTitle}>My Order</CustomText>
                    <View style={styles.badgeContainer}>
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.regular} color={theme.colors.theme}>
                            {totalQty}
                        </CustomText>
                    </View>
                </View>
                <View style={{ width: 80 }} /> {/* to balance the back button */}
            </View>

            {/* Cart List */}
            <View style={styles.listContainer}>
                <FlatList
                    data={cartItems}
                    keyExtractor={item => item.localCartId || item.id}
                    renderItem={renderCartItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListFooterComponent={
                        <View style={styles.instructionContainer}>
                            <Ionicons name="chatbox-ellipses-outline" size={22} color={theme.colors.grayDark} />
                            <TextInput
                                style={styles.instructionInput}
                                placeholder="Add instructional (optional)"
                                placeholderTextColor={theme.colors.light_gray}
                                value={instruction}
                                onChangeText={(text) => dispatch(setGlobalInstruction(text))}
                            />
                        </View>
                    }
                />
            </View>

            {/* Dock Component */}
            <BottomDock
                itemCount={totalQty}
                subTotal={subTotal}
                onCancel={() => router.back()}
                onProceed={() => router.push('/payment')}
                proceedText="Confirm"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        zIndex: 10,
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
        width: 100,
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
    },
    headerTitle: {
        color: theme.colors.text,
    },
    badgeContainer: {
        backgroundColor: theme.colors.theme_light,
        paddingHorizontal: theme.spacing.sm,
        borderRadius: theme.border.md,
        minWidth: 30,
        alignItems: 'center',
    },
    listContainer: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.background,
    },
    listContent: {
        paddingVertical: theme.spacing.md,
        paddingBottom: 150,
    },
    cartItemCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: theme.border.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        boxShadow: '0px 4px 10px 0px rgba(0, 0, 0, 0.05)',
    },
    itemImageContainer: {
        width: 120,
        height: 120,
        borderRadius: theme.border.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    itemDetails: {
        flex: 1,
        flexDirection: 'column',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    itemName: {
        color: theme.colors.text,
        flex: 1,
    },
    deleteBtn: {
        padding: theme.spacing.xs,
    },
    itemSize: {
        marginTop: theme.spacing.xs,
    },
    priceActionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginTop: 'auto',
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: theme.border.md,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
    },
    qtyBtn: {
        paddingHorizontal: theme.spacing.md,
        height: 50,
        minWidth: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyBtnPlus: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyValueContainer: {
        paddingHorizontal: theme.spacing.lg,
        height: 50,
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
    },
    instructionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.white,
        borderRadius: theme.border.md,
        paddingHorizontal: theme.spacing.md,
        marginTop: theme.spacing.md,
        height: 60,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    instructionInput: {
        flex: 1,
        fontSize: theme.fontSize.medium,
        color: theme.colors.text,
        marginLeft: theme.spacing.sm,
    }
});
