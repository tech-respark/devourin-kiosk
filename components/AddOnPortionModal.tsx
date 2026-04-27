import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartWithOptions, CartAddon } from '../src/store/cartSlice';
import { selectAddOnCategories, selectAddOnItems } from '../src/store/menuSlice';
import { theme } from '../src/styles/theme';
import CustomText from './CustomText';

interface AddOnPortionModalProps {
    visible: boolean;
    item: any; // raw menu item
    onClose: () => void;
}

export const AddOnPortionModal: React.FC<AddOnPortionModalProps> = ({ visible, item, onClose }) => {
    const dispatch = useDispatch();
    const addOnItems = useSelector(selectAddOnItems);
    const addOnCategories = useSelector(selectAddOnCategories);

    // Default to first portion if item has portions
    const [selectedPortion, setSelectedPortion] = useState<any>(item?.portions?.[0] ?? item);
    const [organizedAddOn, setOrganizedAddOn] = useState<any[]>([]);
    const [selectedAddons, setSelectedAddons] = useState<any[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [addOnPrice, setAddOnPrice] = useState(0);
    const [instructions, setInstructions] = useState('');

    const itemName = item?.name ?? '';
    const portionPrice =
        selectedPortion?.salePrice && selectedPortion.salePrice !== 0
            ? selectedPortion.salePrice
            : selectedPortion?.price ?? item?.price ?? 0;

    const totalPrice = quantity * (portionPrice + addOnPrice);

    // Reset state when item changes
    useEffect(() => {
        if (item) {
            setSelectedPortion(item?.portions?.[0] ?? item);
            setSelectedAddons([]);
            setAddOnPrice(0);
            setQuantity(1);
            setInstructions('');
        }
    }, [item?.itemId]);

    // Organize addons by category for this item
    useEffect(() => {
        if (!item) return;
        const organized = addOnItems.reduce((acc: any[], addonItem: any) => {
            if (String(addonItem.itemId) !== String(item.itemId)) return acc;
            const matchingCategory = addOnCategories.find((cat: any) => String(cat.id) === String(addonItem.addonCatId));
            const categoryName = addonItem.category || 'Others';
            const existing = acc.find((c: any) => c.title === categoryName);
            if (existing) {
                existing.data.push(addonItem);
            } else {
                acc.push({
                    title: categoryName,
                    min: matchingCategory?.min ?? 0,
                    max: matchingCategory?.max ?? 0,
                    data: [addonItem],
                });
            }
            return acc;
        }, []);
        setOrganizedAddOn(organized);
    }, [item?.itemId, addOnItems, addOnCategories]);

    const handleAddonChange = (addon: any, change: number, catIndex: number) => {
        setSelectedAddons((prev) => {
            const updated = [...prev];
            const idx = updated.findIndex((a) => a.addonId === addon.addonId);
            const cat = organizedAddOn[catIndex];
            const maxPerCat = cat?.max;

            if (maxPerCat) {
                const catTotal =
                    updated.filter((a) => a.addonCatId === addon.addonCatId).reduce((s, a) => s + (a.quantity || 0), 0) + change;
                if (catTotal > maxPerCat * quantity) {
                    Toast.show({ type: 'error', text1: `Max ${maxPerCat} addons for ${cat.title}` });
                    return prev;
                }
            }
            if (idx !== -1) {
                updated[idx].quantity = (updated[idx].quantity || 0) + change * quantity;
                if (updated[idx].quantity <= 0) updated.splice(idx, 1);
            } else if (change > 0) {
                updated.push({ ...addon, quantity: change * quantity });
            }
            const newAddOnPrice = updated.reduce((s, a) => s + (a.price || 0) * (a.quantity / quantity || 1), 0);
            setAddOnPrice(newAddOnPrice);
            return updated;
        });
    };

    const handleItemQty = (change: number) => {
        const newQty = quantity + change;
        if (newQty <= 0) {
            onClose();
            return;
        }
        const ratio = newQty / quantity;
        setQuantity(newQty);
        setSelectedAddons((prev) =>
            prev.map((a) => ({ ...a, quantity: Math.max(1, Math.round(a.quantity * ratio)) }))
        );
    };

    const validate = () => {
        for (const cat of organizedAddOn) {
            if (cat.min > 0) {
                const total = selectedAddons
                    .filter((a) => a.category === cat.title)
                    .reduce((s, a) => s + (a.quantity || 0), 0);
                if (total < cat.min) {
                    Toast.show({ type: 'error', text1: `${cat.title} requires at least ${cat.min} addon(s)` });
                    return false;
                }
            }
        }
        return true;
    };

    const handleAddToCart = () => {
        if (!validate()) return;

        const cartAddons: CartAddon[] = selectedAddons.map((a) => ({
            addonId: a.addonId,
            addon: a.addon,
            price: a.price,
            quantity: a.quantity,
            addonCatId: a.addonCatId,
            category: a.category || '',
            cgst: a.cgst || 0,
            sgst: a.sgst || 0,
            igst: a.igst || 0,
            vat: a.vat || 0,
            chargable: a.chargable || 0,
            forAll: a.forAll || 0,
        }));

        dispatch(addToCartWithOptions({
            item: {
                itemId: item.itemId,
                categoryId: item.categoryId,
                name: item.name,
                price: portionPrice,
                salePrice: selectedPortion?.salePrice ?? 0,
                isVeg: item.it === 1,
                imageColor: item.imageColor || '#FCF1E4',
                customAttributeId: selectedPortion?.customAttributeId ?? 0,
                attributeName: selectedPortion?.attributeName ?? '',
                cgst: item.cgst || 0,
                sgst: item.sgst || 0,
                igst: item.igst || 0,
                vat: item.vat || 0,
                sc: item.sc || 0,
            },
            quantity,
            remark: instructions.trim() || undefined,
            addOns: cartAddons.length > 0 ? cartAddons : undefined,
        }));
        onClose();
    };

    if (!visible || !item) return null;
    return (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 99999 }}>
            <View style={styles.overlay}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <View style={[styles.vegDot, { backgroundColor: item.it === 1 ? theme.colors.success : theme.colors.theme }]} />
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingX} color={theme.colors.text} numberOfLines={1} style={{ flex: 1 }}>
                                {itemName}
                            </CustomText>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={24} color={theme.colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                        {/* Portion Selector */}
                        {item?.portions && item.portions.length > 0 && (
                            <View style={styles.section}>
                                <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} color={theme.colors.text} style={styles.sectionTitle}>
                                    Select Portion
                                </CustomText>
                                <FlatList
                                    data={item.portions}
                                    scrollEnabled={false}
                                    keyExtractor={(_, i) => i.toString()}
                                    renderItem={({ item: portion }) => {
                                        const isSelected = selectedPortion?.customAttributeId === portion.customAttributeId;
                                        const portionDisplayPrice = portion.salePrice && portion.salePrice !== 0 ? portion.salePrice : portion.price;
                                        return (
                                            <Pressable style={styles.portionRow} onPress={() => setSelectedPortion(portion)}>
                                                <CustomText
                                                    fontFamily={isSelected ? theme.fonts.SemiBold : theme.fonts.Regular}
                                                    fontSize={theme.fontSize.medium}
                                                    color={theme.colors.text}
                                                    style={{ flex: 1 }}
                                                >
                                                    {portion.attributeName}
                                                </CustomText>
                                                <CustomText fontFamily={isSelected ? theme.fonts.SemiBold : theme.fonts.Regular} fontSize={theme.fontSize.medium} color={theme.colors.black}>
                                                    ₹{portionDisplayPrice}
                                                </CustomText>
                                                <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                                                    {isSelected && <View style={styles.radioInner} />}
                                                </View>
                                            </Pressable>
                                        );
                                    }}
                                />
                            </View>
                        )}

                        {/* Addon Categories */}
                        {organizedAddOn.length > 0 && (
                            <View style={styles.section}>
                                <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} color={theme.colors.text} style={styles.sectionTitle}>
                                    Select Add-Ons
                                </CustomText>
                                {organizedAddOn.map((cat, catIdx) => (
                                    <View key={cat.title}>
                                        <View style={styles.catHeaderRow}>
                                            <CustomText fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.medium} color={theme.colors.text}>
                                                {cat.title}
                                            </CustomText>
                                            {(cat.min > 0 || cat.max > 0) && (
                                                <View style={styles.minMaxBadge}>
                                                    <CustomText fontSize={theme.fontSize.small} color={theme.colors.theme} fontFamily={theme.fonts.Medium}>
                                                        {cat.min > 0 && cat.max > 0 ? `Min ${cat.min} · Max ${cat.max}` : cat.min > 0 ? `Min ${cat.min} required` : `Max ${cat.max}`}
                                                    </CustomText>
                                                    {cat.min > 0 && <CustomText fontSize={theme.fontSize.small} color="#E53935"> *</CustomText>}
                                                </View>
                                            )}
                                        </View>
                                        <FlatList
                                            data={cat.data}
                                            scrollEnabled={false}
                                            keyExtractor={(_, i) => i.toString()}
                                            renderItem={({ item: addon }) => {
                                                const found = selectedAddons.find((a) => a.addonId === addon.addonId);
                                                const addonQty = found ? Math.round(found.quantity / quantity) : 0;
                                                return (
                                                    <View style={styles.addonRow}>
                                                        <CustomText
                                                            fontFamily={addonQty > 0 ? theme.fonts.SemiBold : theme.fonts.Regular}
                                                            fontSize={theme.fontSize.medium}
                                                            color={theme.colors.text}
                                                            style={{ flex: 1 }}
                                                        >
                                                            {addon.addon}
                                                        </CustomText>
                                                        <View style={styles.addonCounter}>
                                                            <TouchableOpacity
                                                                style={[styles.addonBtn, addonQty === 0 && styles.addonBtnDisabled]}
                                                                onPress={() => handleAddonChange(addon, -1, catIdx)}
                                                                disabled={addonQty === 0}
                                                            >
                                                                <Ionicons name="remove" size={16} color={addonQty === 0 ? '#ccc' : theme.colors.white} />
                                                            </TouchableOpacity>
                                                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.medium} color={theme.colors.text} style={{ width: 28, textAlign: 'center' }}>
                                                                {addonQty}
                                                            </CustomText>
                                                            <TouchableOpacity style={styles.addonBtn} onPress={() => handleAddonChange(addon, 1, catIdx)}>
                                                                <Ionicons name="add" size={16} color={theme.colors.white} />
                                                            </TouchableOpacity>
                                                        </View>
                                                        <CustomText fontFamily={theme.fonts.Medium} fontSize={theme.fontSize.medium} color={theme.colors.grayDark} style={{ width: 70, textAlign: 'right' }}>
                                                            ₹{addon.price}
                                                        </CustomText>
                                                    </View>
                                                );
                                            }}
                                        />
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Special Instructions */}
                        <View style={styles.section}>
                            <CustomText fontFamily={theme.fonts.SemiBold} fontSize={theme.fontSize.medium} color={theme.colors.text} style={styles.sectionTitle}>
                                Special Instructions <CustomText fontSize={theme.fontSize.small} color={theme.colors.grayDark}>(optional)</CustomText>
                            </CustomText>
                            <TextInput
                                style={styles.instructionInput}
                                placeholder="e.g. Extra spicy, no onions..."
                                placeholderTextColor={theme.colors.grayDark}
                                value={instructions}
                                onChangeText={setInstructions}
                                multiline
                                numberOfLines={2}
                            />
                        </View>
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footer}>
                        {/* Item Qty Counter */}
                        <View style={styles.itemQtyControl}>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => handleItemQty(-1)}>
                                <Ionicons name="remove" size={20} color={theme.colors.white} />
                            </TouchableOpacity>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color={theme.colors.black} style={{ width: 40, textAlign: 'center' }}>
                                {quantity}
                            </CustomText>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => handleItemQty(1)}>
                                <Ionicons name="add" size={20} color={theme.colors.white} />
                            </TouchableOpacity>
                        </View>

                        {/* Add Button */}
                        <TouchableOpacity style={{ flex: 1, marginLeft: theme.spacing.md }} onPress={handleAddToCart} activeOpacity={0.85}>
                            <LinearGradient colors={['#DD7E33', '#D95C20']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.addButton}>
                                <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color={theme.colors.white}>
                                    Add  ·  ₹{totalPrice.toFixed(0)}
                                </CustomText>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
        alignItems: 'center',
        zIndex: 9999,
    },
    container: {
        width: '100%',
        maxWidth: 600,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        maxHeight: '90%',
        minHeight: 400,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 20,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: theme.border.xl,
        borderTopRightRadius: theme.border.xl,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    vegDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    closeBtn: {
        padding: theme.spacing.sm,
        borderRadius: theme.border.full,
        backgroundColor: '#F3F4F6',
    },
    body: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
    },
    section: {
        backgroundColor: theme.colors.white,
        borderRadius: theme.border.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    sectionTitle: {
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        marginBottom: theme.spacing.sm,
    },
    portionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        gap: theme.spacing.md,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#CCC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: theme.colors.theme,
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: theme.colors.theme,
    },
    catHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: theme.spacing.sm,
        marginBottom: theme.spacing.xs,
    },
    minMaxBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.theme_light2,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: 2,
        borderRadius: theme.border.full,
    },
    addonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    addonCounter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: theme.spacing.sm,
    },
    addonBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: theme.colors.theme,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addonBtnDisabled: {
        backgroundColor: '#E5E7EB',
    },
    instructionInput: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: theme.border.sm,
        padding: theme.spacing.md,
        fontSize: theme.fontSize.medium,
        color: theme.colors.text,
        minHeight: 70,
        textAlignVertical: 'top',
        fontFamily: theme.fonts.Regular,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        backgroundColor: theme.colors.white,
    },
    itemQtyControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F6FB',
        borderRadius: theme.border.sm,
        overflow: 'hidden',
        height: 52,
    },
    qtyBtn: {
        width: 44,
        height: '100%',
        backgroundColor: theme.colors.theme,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButton: {
        borderRadius: theme.border.md,
        height: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
