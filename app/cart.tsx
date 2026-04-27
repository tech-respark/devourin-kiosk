import { Feather } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    FlatList,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { BottomDock } from '../components/BottomDock';
import CustomText from '../components/CustomText';
import {
    removeFromCart,
    selectCartItems,
    selectCartSubtotal,
    setItemRemark,
    updateQuantity,
} from '../src/store/cartSlice';
import { theme } from '../src/styles/theme';
import { AppConfig } from '../src/utils/AppConfig';

export default function MyOrderCart() {
    const dispatch = useDispatch();
    const router = useRouter();
    const cartItems = useSelector(selectCartItems);
    const subTotal = useSelector(selectCartSubtotal);

    const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const updateQty = (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        dispatch(updateQuantity({ itemId, quantity: newQuantity }));
    };

    const removeItem = (itemId: number) => {
        dispatch(removeFromCart(itemId));
    };

    const renderCartItem = ({ item }: { item: any }) => (
        <View style={styles.cartItemCard}>
            {/* Item Image */}
            <View style={[styles.itemImageContainer, { backgroundColor: item.imageColor || '#F3F6FB' }]}>
                <Ionicons name="fast-food-outline" size={50} color={theme.colors.theme} />
            </View>

            <View style={styles.itemDetails}>
                <View style={styles.itemHeader}>
                    <View style={styles.itemNameRow}>
                        <View style={[styles.vegDot, { backgroundColor: item.isVeg ? theme.colors.success : theme.colors.theme }]} />
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} style={styles.itemName} numberOfLines={2}>
                            {item.name}{item.attributeName ? ` (${item.attributeName})` : ''}
                        </CustomText>
                    </View>
                    <TouchableOpacity onPress={() => removeItem(item.itemId)} style={styles.deleteBtn}>
                        <Ionicons name="trash-outline" size={22} color={theme.colors.grayDark} />
                    </TouchableOpacity>
                </View>

                {/* Addons */}
                {item.addOns && item.addOns.length > 0 && (
                    <View style={styles.addonsList}>
                        {item.addOns.map((addon: any, idx: number) => (
                            <CustomText key={idx} fontSize={theme.fontSize.small} color={theme.colors.grayDark}>
                                • {addon.addon} x{Math.round(addon.quantity / item.quantity)} — ₹{addon.price}
                            </CustomText>
                        ))}
                    </View>
                )}

                <View style={styles.instructionContainer}>
                    <Feather name="edit-2" size={18} color={item.remark ? '#8B0000' : theme.colors.theme} />
                    <TextInput
                        style={[styles.input, { fontFamily: theme.fonts.Medium }]}
                        value={item.remark}
                        onChangeText={(text) => { dispatch(setItemRemark({ localCartId: item.localCartId, remark: text })); }}
                        placeholder="Add Instruction"
                        placeholderTextColor={theme.colors.theme}
                        multiline
                    />
                </View>

                <View style={styles.priceActionRow}>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.heading} color={theme.colors.black}>
                        ₹{item.price.toFixed(0)}
                    </CustomText>

                    <View style={styles.qtyContainer}>
                        <TouchableOpacity
                            disabled={item.quantity === 1}
                            style={[styles.qtyBtn, { backgroundColor: item.quantity === 1 ? theme.colors.background : theme.colors.white }]}
                            onPress={() => updateQty(item.itemId, item.quantity - 1)}
                        >
                            <Ionicons name="remove" size={24} color={item.quantity === 1 ? theme.colors.light_gray : theme.colors.black} />
                        </TouchableOpacity>

                        <View style={styles.qtyValueContainer}>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.medium}>
                                {item.quantity}
                            </CustomText>
                        </View>

                        <TouchableOpacity onPress={() => updateQty(item.itemId, item.quantity + 1)}>
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
                        <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.medium} color={theme.colors.theme}>
                            {totalQty}
                        </CustomText>
                    </View>
                </View>
                <View style={{ width: 80 }} />
            </View>

            {/* Cart List */}
            <View style={styles.listContainer}>
                <FlatList
                    data={cartItems}
                    keyExtractor={item => item.localCartId || item.itemId.toString()}
                    renderItem={renderCartItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Ionicons name="bag-outline" size={64} color={theme.colors.grayDark} />
                            <CustomText fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.large} color={theme.colors.grayDark} style={{ marginTop: 16 }}>
                                Your cart is empty
                            </CustomText>
                        </View>
                    }
                />
            </View>

            {/* Dock Component */}
            <BottomDock
                itemCount={totalQty}
                subTotal={subTotal}
                onCancel={() => router.back()}
                onProceed={() => {
                    if (AppConfig.CUSTOMER_DETAILS_REQUIRED) {
                        router.push('/customer');
                    } else {
                        router.push('/payment');
                    }
                }}
                proceedText="Confirm"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
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
    input: {
        fontSize: theme.fontSize.small,
        borderRadius: 5,
        marginLeft: 3,
        backgroundColor: '#fff',
        color: '#8B0000',
        width: '50%',
        includeFontPadding: false
    },
    instructionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
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
    headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs },
    headerTitle: { color: theme.colors.text },
    badgeContainer: {
        backgroundColor: theme.colors.theme_light,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.border.md,
        minWidth: 30,
        alignItems: 'center',
        marginLeft: 5
    },
    listContainer: { flex: 1, paddingHorizontal: theme.spacing.md, backgroundColor: theme.colors.background },
    listContent: { paddingVertical: theme.spacing.md, paddingBottom: 150 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
    cartItemCard: {
        flexDirection: 'row',
        backgroundColor: theme.colors.white,
        borderRadius: theme.border.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        boxShadow: '0px 2px 8px 0px rgba(0, 0, 0, 0.06)',
    },
    itemImageContainer: {
        width: 110,
        height: 110,
        borderRadius: theme.border.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    itemDetails: { flex: 1, flexDirection: 'column' },
    itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    itemNameRow: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, gap: 6 },
    vegDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
    itemName: { color: theme.colors.text, flex: 1 },
    deleteBtn: { padding: theme.spacing.xs },
    addonsList: { marginTop: 4, marginBottom: 4, paddingLeft: 16, gap: 2 },
    remarkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.spacing.xs,
        backgroundColor: '#F8FAFF',
        borderRadius: theme.border.xs,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 5,
        borderWidth: 1,
        borderColor: '#E0E8F8',
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
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
        padding: 3
    },
    qtyBtn: {
        paddingHorizontal: theme.spacing.md,
        height: 45,
        width: 45,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.border.sm,
    },
    qtyBtnPlus: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', borderRadius: theme.border.sm },
    qtyValueContainer: { paddingHorizontal: theme.spacing.lg, height: 45, justifyContent: 'center' },
    // Remark Modal
    remarkOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
    },
    remarkCard: {
        backgroundColor: '#fff',
        borderRadius: theme.border.lg,
        padding: theme.spacing.xl,
        width: '60%',
        maxWidth: 500,
    },
    remarkInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: theme.border.sm,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.medium,
        color: theme.colors.text,
        minHeight: 90,
        textAlignVertical: 'top',
        fontFamily: theme.fonts.Regular,
        marginBottom: theme.spacing.lg,
    },
    remarkActions: { flexDirection: 'row', gap: theme.spacing.md },
    remarkCancel: {
        flex: 1,
        height: 52,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: theme.border.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    remarkSave: {
        flex: 1,
        height: 52,
        backgroundColor: theme.colors.theme,
        borderRadius: theme.border.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
