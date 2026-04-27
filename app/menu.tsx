import Ionicons from '@expo/vector-icons/Ionicons';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { BottomDock } from '../components/BottomDock';
import CustomText from '../components/CustomText';
import { ItemCard } from '../components/ItemCard';
import { addToCart, selectCartItems, selectCartSubtotal } from '../src/store/cartSlice';
import { selectOrganisedMenuItems } from '../src/store/menuSlice';
import { theme } from '../src/styles/theme';

export default function MenuDashboard() {
    const dispatch = useDispatch();
    const router = useRouter();
    const organizedMenu = useSelector(selectOrganisedMenuItems);
    const cartItems = useSelector(selectCartItems);
    const cartSubtotal = useSelector(selectCartSubtotal);
    const [activeCategory, setActiveCategory] = useState<string | number | undefined>(organizedMenu[0]?.id);

    useEffect(() => {
        if (!activeCategory && organizedMenu.length > 0) {
            setActiveCategory(organizedMenu[0].id);
        }
    }, [organizedMenu]);

    const currentCategory = organizedMenu.find(c => c.id === activeCategory);

    // Flatten all items within this parent category
    const itemsToDisplay = currentCategory ? [
        ...currentCategory.items,
        ...currentCategory.subcategories.flatMap((sc: any) => sc.items)
    ] : [];

    const handleAddToCart = (item: any) => {
        dispatch(addToCart(item));
    };

    return (
        <SafeAreaView style={styles.container} edges={['bottom', 'top']}>
            {/* Top Header */}
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Ionicons name='search' size={theme.fontSize.heading} color={theme.colors.grayDark} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search for items..."
                        placeholderTextColor={'gray'}
                    />
                </View>
            </View>

            <View style={styles.mainContent}>
                {/* Left Sidebar Categories Strip */}
                <View style={styles.categoriesSection}>
                    <View style={styles.posBadge}>
                        <Image source={require("../assets/icons/app_icon.png")} style={{ width: 75, height: 75 }} />
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                        {organizedMenu.map((cat: any) => {
                            const isActive = cat.id === activeCategory;
                            return (
                                <TouchableOpacity
                                    key={cat.id}
                                    style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                                    onPress={() => setActiveCategory(cat.id)}
                                >
                                    <View style={[styles.categoryIconBg, isActive && styles.categoryIconBgActive]}>
                                        <SimpleLineIcons name='cup' size={theme.fontSize.headingXX} color={isActive ? theme.colors.theme : 'gray'} />
                                    </View>
                                    <CustomText
                                        fontFamily={theme.fonts.Medium}
                                        fontSize={theme.fontSize.small}
                                        style={[styles.categoryName, { color: isActive ? theme.colors.theme : theme.colors.grayDark }]}
                                    >
                                        {cat.title}
                                    </CustomText>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Items Grid */}
                <View style={styles.itemsSection}>
                    <CustomText fontFamily={theme.fonts.Bold} fontSize={theme.fontSize.headingX} style={styles.sectionTitle}>
                        {currentCategory?.title}
                    </CustomText>

                    <FlatList
                        data={itemsToDisplay}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        numColumns={theme.device.isTablet ? 3 : 2}
                        columnWrapperStyle={styles.row}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                        renderItem={({ item }) => (
                            <ItemCard
                                name={item.name}
                                price={item.salePrice !== 0 ? item.salePrice : item.price}
                                isVeg={item.it === 1}
                                imageColor={item.imageColor || '#FCF1E4'}
                                onAdd={() => handleAddToCart(item)}
                            />
                        )}
                    />
                </View>
            </View>

            {/* Bottom Dock */}
            <BottomDock
                itemCount={cartItems.reduce((acc: any, i: any) => acc + i.quantity, 0)}
                subTotal={cartSubtotal}
                onCancel={() => { }}
                onProceed={() => router.push('/cart')}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        backgroundColor: theme.colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        zIndex: 10,
        marginLeft: 110,
    },
    posBadge: {
        marginBottom: theme.spacing.xl,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F6FB',
        borderRadius: theme.border.md,
        paddingHorizontal: theme.spacing.md,
        marginRight: theme.spacing.md,
        height: 50,
    },
    searchInput: {
        flex: 1,
        fontSize: theme.fontSize.medium,
        color: theme.colors.text,
        marginLeft: theme.spacing.sm,
    },
    vegToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F6FB',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.border.md,
        height: 50,
    },
    vegSquare: {
        width: 18,
        height: 18,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        marginRight: theme.spacing.sm,
    },
    vegCircle: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    mainContent: {
        flex: 1,
        flexDirection: 'row',
    },
    categoriesSection: {
        width: 110,
        backgroundColor: theme.colors.white,
        paddingBottom: theme.spacing.xl,
        alignItems: 'center',
        borderRightWidth: 1,
        borderRightColor: '#F0F0F0',
        position: 'absolute',
        top: -80, // overlay over header area to match mobile kiosk design
        bottom: 0,
        left: 0,
        zIndex: 20,
    },
    categoryScroll: {
        alignItems: 'center',
        paddingBottom: theme.spacing.xxxl,
    },
    categoryPill: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'lightgray',
        borderRadius: theme.border.md,
        padding: theme.spacing.sm,
        marginBottom: theme.spacing.lg,
        width: 90,
        height: 90,
    },
    categoryPillActive: {
        borderColor: theme.colors.theme,
        borderWidth: 2,
        backgroundColor: theme.colors.theme_light2
    },
    categoryIconBg: {
        backgroundColor: '#F3F6FB',
        borderRadius: 100,
        padding: 10,
    },
    categoryIconBgActive: {
        backgroundColor: '#FCF1E4', // theme.colors.defaultLight2
    },
    categoryName: {
        textAlign: 'center',
        marginTop: 5
    },
    itemsSection: {
        flex: 1,
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        marginLeft: 110,
        backgroundColor: theme.colors.background
    },
    sectionTitle: {
        color: theme.colors.text,
        marginBottom: theme.spacing.lg,
        marginLeft: theme.spacing.xs,
    },
    listContent: {
        paddingBottom: 150,
    },
    row: {
        justifyContent: 'flex-start',
        gap: theme.spacing.lg,
    }
});
