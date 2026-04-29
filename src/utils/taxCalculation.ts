import { CartItem } from "../store/cartSlice";

/**
 * Ported from DevourinMobile calculateItemTotals
 * Exactly follows the tax logic used in the mobile app and backend
 */
export const calculateItemTotals = (
    item: CartItem,
    isReverseCalculation: boolean,
    isScInclusive: boolean,
    discountPercent: number = 0
) => {
    // Get tax values (exactly like mobile, but ignoring sc as per request)
    const sgst = item.sgst || 0;
    const cgst = item.cgst || 0;
    const vat = item.vat || 0;
    const sc = 0; // Explicitly set to 0 as per request
    const pcAmount = (item as any).pc || 0;

    const totalTaxPercentage = sgst + cgst + sc + vat;

    // Add-ons
    const addOnDetails = item.addOns || [];
    const addOnTotalPrice = addOnDetails.reduce(
        (total: number, addOn: any) =>
            total + (addOn.price || 0) * (addOn.quantity || 1),
        0
    );

    // Base price (Menu Price)
    const menuPrice = item.salePrice && item.salePrice !== 0 ? item.salePrice : item.price;

    // Initial Item Price (Price * Qty + Addons)
    let grossPrice = (menuPrice * item.quantity) + addOnTotalPrice;

    // Apply any external discount percentage
    if (discountPercent > 0) {
        grossPrice = grossPrice * (1 - (discountPercent / 100));
    }

    let finalItemPrice = grossPrice;
    let itemBasePrice = grossPrice;

    // For reverse calculation, the shown subtotal MUST be the base price (tempBase)
    // We also calculate what portion of that base belongs to the main item vs addons
    let itemNetBase = grossPrice;
    let addonNetBase = addOnTotalPrice;
    let tempBase = grossPrice;

    if (isReverseCalculation) {
        if (isScInclusive) {
            if (vat !== 0) {
                tempBase = (grossPrice * 100) / (100 + vat + sc);
                finalItemPrice = tempBase + (tempBase * vat) / 100 + (tempBase * sc) / 100;
            } else {
                tempBase = (grossPrice * 100) / (100 + sgst + cgst + sc);
                finalItemPrice =
                    tempBase +
                    (tempBase * sgst) / 100 +
                    (tempBase * cgst) / 100 +
                    (tempBase * sc) / 100;
            }
        } else {
            if (vat !== 0) {
                tempBase = (grossPrice * 100) / (100 + vat);
                finalItemPrice = tempBase + (tempBase * vat) / 100 + (tempBase * sc) / 100;
            } else {
                tempBase = (grossPrice * 100) / (100 + sgst + cgst);
                finalItemPrice =
                    tempBase + (tempBase * (sgst + cgst)) / 100 + (tempBase * sc) / 100;
            }
        }
        itemBasePrice = grossPrice; // Show inclusive total as subtotal as per request

        // Ratio based split of base price between item and addons (STILL NEEDED for backend)
        const itemRatio = grossPrice > 0 ? ((menuPrice * item.quantity) / grossPrice) : 1;
        itemNetBase = tempBase * itemRatio;
        addonNetBase = tempBase * (1 - itemRatio);

    } else {
        // Forward Calculation
        const totalTaxAmt = (grossPrice * totalTaxPercentage) / 100;
        finalItemPrice = grossPrice + totalTaxAmt;
        itemBasePrice = grossPrice;
        itemNetBase = menuPrice * item.quantity;
        addonNetBase = addOnTotalPrice;
    }

    // Add Fixed Charges (PC, DC) - per item instance
    const totalPc = pcAmount * item.quantity;
    finalItemPrice += totalPc;

    // Calculate tax breakdown based on the appropriate base
    const calculationBase = isReverseCalculation ? tempBase : grossPrice;

    const taxBreakdown = {
        sc: (calculationBase * sc) / 100,
        sgst: (calculationBase * sgst) / 100,
        cgst: (calculationBase * cgst) / 100,
        vat: (calculationBase * vat) / 100,
        pc: totalPc, // Now a fixed amount
        igst: 0,
    };

    return {
        itemSubtotal: itemBasePrice,
        itemGrandTotal: finalItemPrice,
        taxBreakdown,
        itemNetBase,
        addonNetBase
    };
};

/**
 * Calculates summary for the entire cart
 */
export const calculateCartTotals = (cartItems: CartItem[], applicationConfigs: any) => {
    const isReverseCalculation = applicationConfigs?.length > 0 && applicationConfigs?.[0].reverseCalculation === 1;
    const isScInclusive = applicationConfigs?.length > 0 && applicationConfigs?.[0].isScInclusiveInReverseCalc === 1;

    let subtotal = 0;
    let grandTotal = 0;
    let totalTaxBreakdown = {
        sc: 0,
        sgst: 0,
        cgst: 0,
        vat: 0,
        igst: 0,
        pc: 0,
    };

    cartItems.forEach(item => {
        const { itemSubtotal, itemGrandTotal, taxBreakdown } = calculateItemTotals(item, isReverseCalculation, isScInclusive);
        subtotal += itemSubtotal;
        grandTotal += itemGrandTotal;
        totalTaxBreakdown.sc += taxBreakdown.sc;
        totalTaxBreakdown.sgst += taxBreakdown.sgst;
        totalTaxBreakdown.cgst += taxBreakdown.cgst;
        totalTaxBreakdown.vat += taxBreakdown.vat;
        totalTaxBreakdown.igst += taxBreakdown.igst;
        totalTaxBreakdown.pc += (taxBreakdown as any).pc || 0;
    });

    return {
        subtotal,
        grandTotal,
        taxBreakdown: totalTaxBreakdown,
        isReverseCalculation
    };
};
