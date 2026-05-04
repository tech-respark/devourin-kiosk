import moment from 'moment';
import { store } from '../store';
import { CartItem } from '../store/cartSlice';
import { calculateCartTotals, calculateItemTotals } from './taxCalculation';

/**
 * Maps a single kiosk cart item to the orderbystaffmobile API item format.
 * Mirrored from devourin-mobile's Cart.tsx mapSingleOrderItem, simplified for kiosk.
 */
export const mapSingleOrderItem = (cartItem: CartItem, staffId: number) => {
    let addOnPrice = 0;
    const addOnName: string[] = [];

    const addons = (cartItem.addOns || []).map((addon) => {
        addOnName.push(addon.addon);
        addOnPrice += addon.price * addon.quantity;
        return {
            addon: {
                active: 1,
                addonCategoryId: addon.addonCatId,
                cgst: addon.cgst || 0,
                chargable: addon.chargable || 0,
                forAll: addon.forAll || 0,
                id: null,
                igst: addon.igst || 0,
                name: addon.addon,
                price: addon.price,
                sgst: addon.sgst || 0,
            },
            addonId: addon.addonId,
            addon_resolvedKey: addon.addonId,
            quantity: addon.quantity,
        };
    });

    const hasCustomAttribute = cartItem.customAttributeId && cartItem.customAttributeId !== 0;
    const customAttribute = hasCustomAttribute
        ? { active: 1, id: cartItem.customAttributeId, name: cartItem.attributeName }
        : null;

    const price = (cartItem.salePrice && cartItem.salePrice !== 0) ? cartItem.salePrice : cartItem.price;

    return {
        id: null,
        addons,
        addonsList: [...addOnName],
        addonsPrice: addOnPrice,
        isChargeable: 1,
        isCustomizable: false,
        isLastSerItem: true,
        isSelected: false,
        itemPrice: price.toString(),
        kotSource: 'Kiosk',
        serveRound: 0,
        accepted: 1,
        itemName: cartItem.attributeName
            ? `${cartItem.name} (${cartItem.attributeName})`
            : cartItem.name,
        attributeId: cartItem.customAttributeId || 0,
        cgst: cartItem.cgst || 0,
        customAttribute,
        customAttribute__resolvedKey: hasCustomAttribute ? cartItem.customAttributeId : null,
        customPrice: 0,
        deleted: 0,
        igst: cartItem.igst || 0,
        reqId: null,
        itemId: cartItem.itemId,
        kotNo: '',
        price,
        quantity: cartItem.quantity,
        remark: cartItem.remark || '',
        sgst: cartItem.sgst || 0,
        staffId,
        vat: cartItem.vat || 0,
        sc: cartItem.sc || 0,
        section: null,
        courseId: null,
        delayInMins: null,
        kotPlaceTime: moment().format("YYYY-MM-DD HH:mm:ss"),
        discount: 0,
    };
};

/**
 * Builds the complete POST payload for orderbystaffmobile.
 * Kiosk-specific: tableNo=0, source=Kiosk, orderType=Rest_Takeaway, no KOT fetching needed.
 */
export const buildKioskOrderPayload = (
    cartItems: CartItem[],
    paymentTxnName: string = 'UPI'
) => {
    const state = store.getState();
    const userData = state.user.userData;
    const branchId = state.user.branchId;
    const taxes = state.user.taxes;
    const customerDetails = state.user.customerDetails;

    const staffId = userData?.userId ?? 0;
    const uniqueId = new Date().getTime().toString();

    const orderItems = cartItems.map(item => mapSingleOrderItem(item, staffId));
    const applicationConfigs = state.user.applicationConfigs;

    // Calculate totals using official logic
    const { subtotal, grandTotal } = calculateCartTotals(cartItems, applicationConfigs);
    const roundedTotal = Math.round(grandTotal);

    // Build payment entry
    const orderPayments = [{
        orderId: null,
        id: null,
        splitId: null,
        vendor: null,
        txn: paymentTxnName,
        amount: roundedTotal,
        cardNo: null,
        nameOnCard: null,
        remark: null,
        paidOn: null,
        modifiedOn: null,
        bankName: null,
        txnId: null,
        creditId: null,
        edcTerminalName: null,
        id4UI: "4",
        name: paymentTxnName,
        free: 0,
        parentId: null,
        hasChildType: 0,
        active: 1,
        multiEntry: 0,
        card: 0,
        credit: 0,
        cash: paymentTxnName === 'Cash' ? 1 : 0,
        whereToShow: 2,
        isSelected: 1,
    }];

    const authUser = customerDetails
        ? {
            firstName: customerDetails.name,
            lastName: '',
            mobile: customerDetails.mobile,
            userId: null,
        }
        : null;

    const payload = {
        allCgst: [],
        allGst: [],
        allGstValue: 0,
        allIgst: [],
        allSgst: [],
        allVat: [],
        currentStatus: {
            id: null,
            orderId: null,
            staffId,
            status: 'NO_STATUS',
            statusTime: '',
        },
        discounts: [],
        isCurrentOrder: true,
        isItemSelected: false,
        orderItems: orderItems,
        mergeTables: null,
        qtyToServed: 0,
        orderPrice: roundedTotal,
        taxes: taxes?.[0] ?? null,
        id: null,
        totalDiscount: 0,
        branchId,
        brandId: 0,
        instruction: '',
        invoiceNo: null,
        isCaptainOrder: 0,
        isMerge: 0,
        noOfPeople: 0,
        orderTime: null,
        orderType: 'Rest_Takeaway',
        reqid: null,
        reservationId: null,
        serveCounter: 0,
        serviceChargePrec: 0,
        serviceCharges: 0,
        source: 'Kiosk',
        staffId,
        subTotal: roundedTotal,
        thirdPartyId: 0,
        total: grandTotal,
        grandTotal,
        tableNo: 0,
        userId: null,
        waiterId: staffId,
        uniqueIdentifier: uniqueId,
        splitOrder: [],
        splitBy: 1,
        taxOnCharges: [],
        orderPayments,
        paidAmt: roundedTotal,
        txn: paymentTxnName,
        kots: { "00": [] },
        ...(authUser && { authUser }),
    };

    return payload;
};

/**
 * Builds the payload for Plural/validateOrder and razororder1
 * Matches the user-provided structure precisely.
 */
export const buildPluralOrderPayload = (
    cartItems: CartItem[],
    isQRPayment: boolean,
) => {
    const state = store.getState();
    const branchId = state.user.branchId;
    const applicationConfigs = state.user.applicationConfigs;
    const customerDetails = state.user.customerDetails;
    const uniqueId = new Date().getTime().toString();

    const isReverseCalculation = applicationConfigs?.length > 0 && applicationConfigs?.[0].reverseCalculation === 1;
    const isScInclusive = applicationConfigs?.length > 0 && applicationConfigs?.[0].isScInclusiveInReverseCalc === 1;

    // Calculate overall totals
    const totals = calculateCartTotals(cartItems, applicationConfigs);

    const orderITems = cartItems.map(item => {
        const { itemSubtotal, itemGrandTotal, taxBreakdown, itemNetBase, addonNetBase } = calculateItemTotals(item, isReverseCalculation, isScInclusive);

        // Sum individual tax components for itemTax field
        const itemTotalTax = Object.values(taxBreakdown).reduce((a, b) => a + b, 0);

        return {
            id: null,
            orderId: null,
            itemId: item.itemId,
            quantity: item.quantity,
            attributeId: item.customAttributeId || 0,
            price: item.price,
            kotNo: "",
            served: 0,
            printed: 0,
            deleted: 0,
            accepted: 1,
            addedOn: "",
            modifiedOn: "",
            itemReduced: 0,
            remark: item.remark || "",
            addons: (item.addOns || []).map(a => ({
                id: null,
                addonId: a.addonId,
                name: a.addon,
                price: a.price,
                quantity: a.quantity,
                cgst: a.cgst || 0,
                sgst: a.sgst || 0,
            })),
            complimentary: 0,
            isModified: 0,
            eta: 0,
            kg: 0,
            gms: 0,
            discount: 0,
            pc: 0,
            sc: item.sc || 0,
            dc: 0,
            attributeName: item.attributeName || "null",
            it: item.isVeg ? 1 : 2,
            available: 1,
            section: "Food",
            categoryId: item.categoryId,
            discounted: 1,
            name: item.name,
            customizable: 0,
            imagePath: null,
            cTag: null,
            availableBetween: "10:00-23:00",
            cgst: item.cgst || 0,
            sgst: item.sgst || 0,
            surCharge: 0,
            vat: item.vat || 0,
            unit: "Qty",
            itemTotal: Number(itemNetBase.toFixed(2)),
            itemTax: Number(itemTotalTax.toFixed(2)),
            addonTotal: Number(addonNetBase.toFixed(2)),
            itemSc: taxBreakdown.sc
        };
    });

    return {
        branchId: Number(branchId),
        eta: 0,
        rating: 0,
        subTotal: totals.subtotal,
        total: Number(totals.grandTotal.toFixed(2)),
        tableNo: 0,
        thirdPartyId: 0,
        currentStatus: {
            id: null,
            orderId: null,
            status: isQRPayment ? "NO_STATUS" : "QSR_KOT_BILL_SETTLED",
            statusTime: "",
            remark: null,
            staffId: null
        },
        source: "Website",
        orderITems,
        couponIds: null,
        availedCoupons: null,
        packagingCharges: 0,
        deliveryCharges: 0,
        serviceCharges: 0,
        orderType: "Web_Takeaway",
        pdTime: null,
        address: {},
        longitude: 0,
        lattitude: 0,
        loyaltyId: null,
        redeemRs: null,
        orderPayments: [],
        uniqueIdentifier: uniqueId,
        userId: customerDetails?.userId?.toString() || "null"
    };
};
