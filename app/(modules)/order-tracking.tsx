import { useAppSelector } from '@/src/store/hooks';
import { selectBranchId } from '@/src/store/userSlice';
import { useEnvironment } from '@/src/utils/Constants';
import { makeAPIRequest } from '@/src/utils/Helper';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImageBackground, Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConfirmationModal } from '../../components/ConfirmationModal';
import CustomText from '../../components/CustomText';
import { theme } from '../../src/styles/theme';

const PREPARING_LOGO = require('../../assets/icons/preparing.png');
const READY_LOGO = require('../../assets/icons/ready.png');

interface TrackingOrder {
    invoiceNo: string;
    orderId: string;
    ready: boolean;
}

const POLL_INTERVAL_MS = 10000;
const SCROLL_TICK_MS = 30;
const SCROLL_STEP = 0.6;

const OrderColumn = ({ title, orders, titleColor, cardBgColor, cardTextColor }: {
    title: string;
    orders: TrackingOrder[];
    titleColor: string;
    cardBgColor: string;
    cardTextColor: string;
}) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [layoutHeight, setLayoutHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);

    const scrollYRef = useRef(0);
    const directionRef = useRef(1); // 1 = down, -1 = up
    const stateRef = useRef<'scrolling' | 'paused'>('scrolling');
    const pauseTicksRef = useRef(0);
    const isDraggingRef = useRef(false);

    const PAUSE_DURATION_TICKS = 100; // 100 ticks * 30ms = 3000ms (3 seconds)

    useEffect(() => {
        const maxScrollY = contentHeight - layoutHeight;

        // If content fits completely, don't scroll and reset scroll to top
        if (maxScrollY <= 0) {
            scrollYRef.current = 0;
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            return;
        }

        // Clamp current scroll position to new max scroll limit if list shrank
        if (scrollYRef.current > maxScrollY) {
            scrollYRef.current = maxScrollY;
            scrollViewRef.current?.scrollTo({ y: maxScrollY, animated: true });
        }

        const interval = setInterval(() => {
            if (isDraggingRef.current) return;

            const currentMax = contentHeight - layoutHeight;
            if (currentMax <= 0) return;

            if (stateRef.current === 'paused') {
                pauseTicksRef.current -= 1;
                if (pauseTicksRef.current <= 0) {
                    stateRef.current = 'scrolling';
                }
                return;
            }

            if (stateRef.current === 'scrolling') {
                let nextY = scrollYRef.current + directionRef.current * SCROLL_STEP;

                if (directionRef.current === 1) {
                    // Scrolling down
                    if (nextY >= currentMax) {
                        nextY = currentMax;
                        directionRef.current = -1; // Change direction to up
                        stateRef.current = 'paused';
                        pauseTicksRef.current = PAUSE_DURATION_TICKS;
                    }
                } else {
                    // Scrolling up
                    if (nextY <= 0) {
                        nextY = 0;
                        directionRef.current = 1; // Change direction to down
                        stateRef.current = 'paused';
                        pauseTicksRef.current = PAUSE_DURATION_TICKS;
                    }
                }

                scrollYRef.current = nextY;
                scrollViewRef.current?.scrollTo({ y: nextY, animated: false });
            }
        }, SCROLL_TICK_MS);

        return () => clearInterval(interval);
    }, [layoutHeight, contentHeight]);

    const handleScrollBeginDrag = () => {
        isDraggingRef.current = true;
    };

    const handleScrollEndDrag = (event: any) => {
        scrollYRef.current = event.nativeEvent.contentOffset.y;
        isDraggingRef.current = false;
        // Pause for a brief moment after user interaction to let them read before resuming
        stateRef.current = 'paused';
        pauseTicksRef.current = 60; // Pause for ~2 seconds
    };

    const handleMomentumScrollEnd = (event: any) => {
        scrollYRef.current = event.nativeEvent.contentOffset.y;
        isDraggingRef.current = false;
    };

    return (
        <View style={[styles.column, { pointerEvents: 'none' }]}>
            <View style={styles.columnHeader}>
                {title === 'PREPARING' ? (
                    <Image source={PREPARING_LOGO} style={styles.statusIcon} />
                ) : (
                    <Image source={READY_LOGO} style={styles.statusIcon} />
                )}
                <CustomText fontFamily={theme.fonts.Medium} fontSize={36} color={titleColor} style={styles.columnTitle}>
                    {title}
                </CustomText>
            </View>

            <ScrollView
                ref={scrollViewRef}
                style={styles.orderScroll}
                contentContainerStyle={styles.orderGrid}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onLayout={(e) => setLayoutHeight(e.nativeEvent.layout.height)}
                onContentSizeChange={(w, h) => setContentHeight(h)}
                onScrollBeginDrag={handleScrollBeginDrag}
                onScrollEndDrag={handleScrollEndDrag}
                onMomentumScrollEnd={handleMomentumScrollEnd}
            >
                {orders.map(order => (
                    <View key={order.orderId} style={[styles.orderCard, { backgroundColor: cardBgColor }]}>
                        <CustomText
                            fontFamily={theme.fonts.Medium}
                            fontSize={44}
                            color={cardTextColor}
                            numberOfLines={1}
                            style={styles.orderNumber}
                        >
                            {order.invoiceNo}
                        </CustomText>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

export default function OrderTrackingScreen() {
    const { apiBaseUrl } = useEnvironment();
    const branchId = useAppSelector(selectBranchId);

    const [orders, setOrders] = useState<TrackingOrder[]>([]);
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);
    const router = useRouter();

    const { width } = useWindowDimensions();
    const isWide = width >= 900;

    const loadOrders = useCallback(async () => {
        const url = apiBaseUrl + `kdsreadyordersbyday?brid=${branchId}&orderday=${moment().format('YYYY-MM-DD')}`;
        const response = await makeAPIRequest(url, null, 'POST');
        if (response?.length > 0) {
            setOrders(response);
        }
    }, []);

    useEffect(() => {
        loadOrders();
        const interval = setInterval(loadOrders, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [loadOrders]);

    const groupedOrders = useMemo(() => {
        const preparingOrders = [];
        const readyOrders = [];
        for (const order of orders) {
            if (order.ready) {
                readyOrders.push(order);
            } else {
                preparingOrders.push(order);
            }
        }
        return {
            preparing: preparingOrders,
            ready: readyOrders,
        }
    }, [orders]);

    const handleLogout = () => {
        setLogoutModalVisible(false);
        router.replace('/login');
    };

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Image
                        source={require('../../assets/icons/sihi_logo.png')}
                        style={styles.sihiLogo}
                        contentFit="contain"
                    />
                    <CustomText fontFamily={theme.fonts.Regular} fontSize={42} color="#000000" style={styles.headerTitle}>
                        Watch out order Here
                    </CustomText>
                </View>
                <Pressable style={styles.poweredBy}
                    // @ts-ignore
                    onContextMenu={(e: any) => e.preventDefault()}
                    onLongPress={() => { setLogoutModalVisible(true); }}
                    delayLongPress={2000}
                >
                    <CustomText fontFamily={theme.fonts.Light} fontSize={20} color="#000000">
                        Powered By
                    </CustomText>
                    <Image
                        source={require('../../assets/icons/logo.png')}
                        style={styles.devourinLogo}
                        contentFit="contain"
                    />
                </Pressable>
            </View>

            <View style={[styles.content, !isWide && styles.contentStacked]}>
                <View style={styles.leftContainer}>
                    <OrderColumn
                        title="PREPARING"
                        orders={groupedOrders.preparing}
                        titleColor="#000000"
                        cardBgColor="#FFFFFF"
                        cardTextColor="#000000"
                    />
                </View>

                <ImageBackground
                    source={require('../../assets/icons/bg.jpg')}
                    style={styles.rightContainer}
                    imageStyle={styles.backgroundImageStyle}
                >
                    <View style={styles.rightOverlayBox}>
                        <OrderColumn
                            title="READY FOR PICKUP"
                            orders={groupedOrders.ready}
                            titleColor="#FFFFFF"
                            cardBgColor="#12B76A"
                            cardTextColor="#FFFFFF"
                        />
                    </View>
                </ImageBackground>
            </View>

            <ConfirmationModal
                visible={logoutModalVisible}
                onClose={() => setLogoutModalVisible(false)}
                onConfirm={handleLogout}
                title="Logout?"
                subtitle="Are you sure you want to exit the tracking screen and logout?"
                cancelText="Cancel"
                confirmText="Yes, Logout"
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        height: 100,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 32,
        paddingTop: Platform.OS === 'web' ? 18 : 8,
        paddingBottom: 12,
        backgroundColor: '#FFFFFF',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
        flex: 1,
    },
    sihiLogo: {
        width: 100,
        height: 100,
    },
    headerTitle: {
        marginTop: 0,
    },
    poweredBy: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    devourinLogo: {
        width: 200,
        height: 50,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
    },
    contentStacked: {
        flexDirection: 'column',
    },
    leftContainer: {
        flex: 1,
        backgroundColor: '#EBEBEB',
        padding: 32,
    },
    rightContainer: {
        flex: 1,
    },
    backgroundImageStyle: {
        resizeMode: 'cover',
    },
    rightOverlayBox: {
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        margin: 16,
        borderRadius: 16,
        padding: 20,
        flex: 1,
    },
    column: {
        flex: 1,
        minWidth: 0,
    },
    columnHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
    },
    columnTitle: {
        flex: 1,
        textTransform: 'uppercase',
    },
    orderScroll: {
        flex: 1,
    },
    orderGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 25,
        paddingBottom: 34,
    },
    orderCard: {
        minWidth: 200,
        width: '45%',
        minHeight: 90,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    orderNumber: {
        maxWidth: '100%',
    },
    statusIcon: {
        width: 55,
        height: 55,
        resizeMode: 'contain',
    },
});
