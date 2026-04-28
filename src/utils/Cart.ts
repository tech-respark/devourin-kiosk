import moment from 'moment';
import { store } from '../store';
import { CartItem } from '../store/cartSlice';

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

    // Calculate totals
    const grandTotal = cartItems.reduce((acc, item) => {
        const addOnTotal = (item.addOns || []).reduce((a, addon) => a + addon.price * addon.quantity, 0);
        return acc + (item.price * item.quantity) + addOnTotal;
    }, 0);
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
            status: 'QSR_KOT_BILL_SETTLED',
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
    cartItems: CartItem[]
) => {
    const state = store.getState();
    const branchId = state.user.branchId;
    const customerDetails = state.user.customerDetails;
    const uniqueId = new Date().getTime().toString();

    // Calculate subtotal and total
    const subTotal = cartItems.reduce((acc, item) => {
        const addOnTotal = (item.addOns || []).reduce((a, addon) => a + addon.price * addon.quantity, 0);
        return acc + (item.price * item.quantity) + addOnTotal;
    }, 0);

    // For now total = subtotal (can add tax logic if needed, but following example)
    const total = subTotal;

    const orderITems = cartItems.map(item => {
        const itemPrice = item.price;
        const itemQty = item.quantity;
        const baseItemTotal = itemPrice * itemQty;

        // Addons base total
        const addOnBaseTotal = (item.addOns || []).reduce((a, ad) => a + ad.price * ad.quantity, 0);

        // Taxes for Item
        const itemCgst = (baseItemTotal * (item.cgst || 0)) / 100;
        const itemSgst = (baseItemTotal * (item.sgst || 0)) / 100;
        const itemIgst = (baseItemTotal * (item.igst || 0)) / 100;
        const itemVat = (baseItemTotal * (item.vat || 0)) / 100;
        const itemTotalTax = itemCgst + itemSgst + itemIgst + itemVat;

        // Taxes for Addons
        const addonTaxTotal = (item.addOns || []).reduce((acc, a) => {
            const addonBase = a.price * a.quantity;
            const a_cgst = (addonBase * (a.cgst || 0)) / 100;
            const a_sgst = (addonBase * (a.sgst || 0)) / 100;
            const a_igst = (addonBase * (a.igst || 0)) / 100;
            const a_vat = (addonBase * (a.vat || 0)) / 100;
            return acc + a_cgst + a_sgst + a_igst + a_vat;
        }, 0);

        return {
            id: null,
            orderId: null,
            itemId: item.itemId,
            quantity: itemQty,
            attributeId: item.customAttributeId || 0,
            price: itemPrice,
            kotNo: "",
            served: 0,
            printed: 0,
            deleted: 0,
            accepted: 1,
            addedOn: "",
            modifiedOn: "",
            itemReduced: 0,
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
            sc: 0,
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
            itemTotal: baseItemTotal,
            itemTax: Number((itemTotalTax + addonTaxTotal).toFixed(2)),
            addonTotal: addOnBaseTotal,
            itemSc: 0
        };
    });

    const totalWithTax = orderITems.reduce((acc, it: any) => acc + it.itemTotal + it.addonTotal + it.itemTax, 0);

    return {
        branchId: Number(branchId),
        eta: 0,
        rating: 0,
        instruction: "",
        subTotal,
        total: Number(totalWithTax.toFixed(2)),
        tableNo: 0,
        thirdPartyId: 0,
        currentStatus: {
            id: null,
            orderId: null,
            status: "QSR_KOT_BILL_SETTLED",
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
        address: {
            addressId: uniqueId,
            line1: "Kiosk Mode",
            area: "Mumbai",
            line2: "Counter Sales",
            city: "Mumbai",
            state: "Maharashtra",
            country: "India",
            pinCode: "400001",
            type: "BRANCH",
            typeId: branchId,
            addressType: "ORDER",
            longitude: 0,
            lattitude: 0
        },
        longitude: 0,
        lattitude: 0,
        loyaltyId: null,
        redeemRs: null,
        orderPayments: [{ txn: "Loyalty", amount: null }],
        uniqueIdentifier: uniqueId,
        userId: "177729094306261586"
    };
};
