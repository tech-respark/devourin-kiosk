import { MaterialCommunityIcons } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import Toast from 'react-native-toast-message';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartWithOptions, CartAddon } from '../src/store/cartSlice';
import { selectAddOnCategories, selectAddOnItems, selectItemImages } from '../src/store/menuSlice';
import { selectMobileSettings } from '../src/store/userSlice';
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
    const itemImages = useSelector(selectItemImages);
    const addOnCategories = useSelector(selectAddOnCategories);
    const mobileSettings = useSelector(selectMobileSettings);
    const currency = mobileSettings?.['currency_symbol'] || '₹';

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
        const targetId = String(item.itemId);
        const targetPortionId = String(selectedPortion?.customAttributeId ?? '');

        const organized = addOnItems.reduce((acc: any[], addonItem: any) => {
            const addonItemId = String(addonItem.itemId || addonItem.itemid || '');
            const addonPortionId = String(addonItem.portionId || addonItem.portionid || addonItem.customAttributeId || '');
            const isForAll = addonItem.forAll === 1 || addonItem.forall === 1;

            const isMatching = (addonItemId === targetId) || isForAll || (addonPortionId !== '' && addonPortionId === targetPortionId);

            if (!isMatching) return acc;

            const matchingCategory = addOnCategories.find((cat: any) => String(cat.id) === String(addonItem.addonCatId));
            const categoryName = addonItem.category || matchingCategory?.name || 'Extra Add-ons';

            const existing = acc.find((c: any) => c.title === categoryName);
            if (existing) {
                if (!existing.data.find((a: any) => a.addonId === addonItem.addonId)) {
                    existing.data.push(addonItem);
                }
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
    }, [item?.itemId, selectedPortion?.customAttributeId, addOnItems, addOnCategories]);

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
                pc: item.pc || 0,
            },
            quantity,
            remark: instructions.trim() || undefined,
            addOns: cartAddons.length > 0 ? cartAddons : undefined,
        }));
        onClose();
    };

    if (!visible || !item) return null;

    console.log(item)
    return (
        <View style={{ ...StyleSheet.absoluteFillObject, zIndex: 99999 }}>
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header with Image & Title */}
                    <View style={styles.header}>
                        <View style={styles.headerRow}>
                            <View style={[styles.imageBox, { backgroundColor: '#FFF7ED', overflow: 'hidden' }]}>
                                {itemImages?.[item.itemId] ? (
                                    <Image source={{ uri: itemImages[item.itemId] }} style={styles.modalImage} resizeMode="cover" />
                                ) : (
                                    <MaterialCommunityIcons name="silverware-fork-knife" size={80} color="#D95C20" />
                                )}
                            </View>
                            <View style={styles.headerInfo}>
                                <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.xsmall} color="#D95C20" style={{ marginBottom: 4 }}>
                                </CustomText>
                                <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXX} color="#162640" style={{ marginBottom: 6 }}>
                                    {itemName}
                                </CustomText>

                                <View style={styles.priceRow}>
                                    <View style={[styles.vegSquare, { borderColor: item.it === 1 ? theme.colors.success : theme.colors.theme }]}>
                                        <View style={[styles.vegCircle, { backgroundColor: item.it === 1 ? theme.colors.success : theme.colors.theme }]} />
                                    </View>
                                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXX} color="#162640">
                                        {currency}{portionPrice}
                                    </CustomText>
                                </View>
                            </View>

                            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                                <Ionicons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView
                        style={styles.body}
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Size (Portions) Section */}
                        {item?.portions && item.portions.length > 0 && (
                            <View style={styles.section}>
                                <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.medium} color="#162640" style={{ marginBottom: 4 }}>
                                    Size
                                </CustomText>
                                <CustomText fontSize={theme.fontSize.xsmall} color="#666" style={{ marginBottom: 15 }}>
                                    Please select any one option
                                </CustomText>

                                <View style={styles.portionWrapper}>
                                    {item.portions.map((portion: any) => {
                                        const isSelected = selectedPortion?.customAttributeId === portion.customAttributeId;
                                        const portionDisplayPrice = portion.salePrice && portion.salePrice !== 0 ? portion.salePrice : portion.price;
                                        return (
                                            <TouchableOpacity
                                                key={portion.customAttributeId}
                                                style={[styles.portionCard, isSelected && styles.portionCardActive]}
                                                onPress={() => setSelectedPortion(portion)}
                                            >
                                                <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
                                                    {isSelected && <View style={styles.radioDot} />}
                                                </View>
                                                <CustomText fontFamily={isSelected ? theme.fonts.SemiBold : theme.fonts.Medium} fontSize={theme.fontSize.small} color="#333" style={{ flex: 1, marginLeft: 8 }}>
                                                    {portion.attributeName}
                                                </CustomText>
                                                <CustomText color="#666" fontSize={theme.fontSize.small}>{currency}{portionDisplayPrice}</CustomText>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {/* Extra Toppings (Add-ons) Grid */}
                        {organizedAddOn.map((cat, catIdx) => (
                            <View key={cat.title} style={styles.section}>
                                <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.medium} color="#162640" style={{ marginBottom: 15 }}>
                                    {cat.title}
                                </CustomText>
                                <View style={styles.addonGrid}>
                                    {cat.data.map((addon: any) => {
                                        const found = selectedAddons.find((a) => a.addonId === addon.addonId);
                                        const isSelected = !!found;
                                        return (
                                            <TouchableOpacity
                                                key={addon.addonId}
                                                style={styles.addonCard}
                                                onPress={() => handleAddonChange(addon, isSelected ? -1 : 1, catIdx)}
                                                activeOpacity={0.7}
                                            >
                                                <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                                                    {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
                                                </View>
                                                <CustomText fontSize={theme.fontSize.small} color="#333" style={{ flex: 1, marginLeft: 10 }}>
                                                    {addon.addon}
                                                </CustomText>
                                                <CustomText fontSize={theme.fontSize.xsmall} color="#666">
                                                    + {currency}{addon.price}
                                                </CustomText>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        ))}

                        {/* Instructions */}
                        <View style={styles.instructionSection}>
                            <View style={styles.instructionHeader}>
                                <Ionicons name="chatbubble-outline" size={18} color="#666" />
                                <TextInput
                                    style={styles.instructionInputModern}
                                    placeholder="Add Instructions (Optional)"
                                    placeholderTextColor="#999"
                                    value={instructions}
                                    onChangeText={setInstructions}
                                />
                            </View>
                        </View>
                        <View style={{ height: 40 }} />
                    </ScrollView>

                    {/* Footer */}
                    <View style={styles.footerModern}>
                        <View style={styles.qtyControlModern}>
                            <TouchableOpacity style={styles.qtyBtnModern} onPress={() => handleItemQty(-1)}>
                                <Ionicons name="remove" size={20} color="#D95C20" />
                            </TouchableOpacity>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color="#162640" style={{ width: 40, textAlign: 'center' }}>
                                {quantity}
                            </CustomText>
                            <TouchableOpacity style={styles.qtyBtnModern} onPress={() => handleItemQty(1)}>
                                <Ionicons name="add" size={20} color="#D95C20" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.totalInfoModern}>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.xsmall} color="#D95C20">TOTAL AMOUNT</CustomText>
                            <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingXX} color="#162640">{currency}{totalPrice.toFixed(1)}</CustomText>
                        </View>

                        <TouchableOpacity onPress={handleAddToCart} activeOpacity={0.85}>
                            <LinearGradient
                                colors={['#DD7E33', '#D95C20']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.addToCartBtnModern}
                            >
                                <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.large} color="#fff">
                                    Add to Cart
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
        backgroundColor: 'rgba(0,0,0,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.md,
    },
    container: {
        width: '100%',
        maxWidth: 800,
        backgroundColor: '#FFFFFF',
        borderRadius: 40,
        maxHeight: '92%',
        overflow: 'hidden',
        elevation: 25,
    },
    header: {
        padding: 30,
        backgroundColor: '#fff',
    },
    headerRow: {
        flexDirection: 'row',
        position: 'relative',
    },
    imageBox: {
        width: 140,
        height: 140,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 25,
    },
    modalImage: {
        width: '100%',
        height: '100%',
    },
    headerInfo: {
        flex: 1,
        paddingTop: 5,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
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
    closeIcon: {
        position: 'absolute',
        top: -10,
        right: -10,
        padding: 8,
    },
    body: {
        flex: 1,
        paddingHorizontal: 30,
    },
    section: {
        marginBottom: 30,
    },
    portionWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    portionCard: {
        flex: 1,
        minWidth: '30%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#fff',
    },
    portionCardActive: {
        borderColor: '#D95C20',
        backgroundColor: '#FFF7ED',
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioCircleActive: {
        borderColor: '#D95C20',
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#D95C20',
    },
    addonGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    addonCard: {
        width: '48.5%',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        backgroundColor: '#fff',
        ...Platform.select({
            web: {
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.02)'
            },
            default: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.02,
                shadowRadius: 4,
            }
        }),
        elevation: 1,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxActive: {
        borderColor: '#D95C20',
        backgroundColor: '#D95C20',
    },
    instructionSection: {
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingBottom: 10,
    },
    instructionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    instructionInputModern: {
        flex: 1,
        fontFamily: theme.fonts.Medium,
        fontSize: theme.fontSize.medium,
        color: '#162640',
        paddingVertical: 10,
        ...(Platform.OS === 'web' ? { outlineStyle: 'none' } : {}),
    },
    footerModern: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 25,
        backgroundColor: '#FFF7ED', // Light orange footer
        borderTopWidth: 1,
        borderTopColor: '#FFEDD5',
    },
    qtyControlModern: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 6,
        ...Platform.select({
            web: {
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)'
            },
            default: {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.05,
                shadowRadius: 10,
            }
        }),
        elevation: 3,
    },
    qtyBtnModern: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
    },
    totalInfoModern: {
        flex: 1,
        marginLeft: 25,
    },
    addToCartBtnModern: {
        paddingHorizontal: 35,
        paddingVertical: 18,
        borderRadius: 18,
        ...Platform.select({
            web: {
                boxShadow: '0px 8px 15px rgba(217, 92, 32, 0.3)'
            },
            default: {
                shadowColor: "#D95C20",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
            }
        }),
        elevation: 8,
    },
});
