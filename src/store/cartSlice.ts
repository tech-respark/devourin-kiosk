import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./index";

export interface CartAddon {
    addonId: number;
    addon: string;
    price: number;
    quantity: number;
    addonCatId: number;
    category: string;
    cgst: number;
    sgst: number;
    igst: number;
    vat: number;
    chargable: number;
    forAll: number;
}

export interface CartItem {
    itemId: number;
    localCartId?: string;
    categoryId: string;
    name: string;
    price: number;
    salePrice?: number;
    isVeg: boolean;
    imageColor: string;
    quantity: number;
    remark?: string;
    addOns?: CartAddon[];
    // Portion fields
    customAttributeId?: number;
    attributeName?: string;
    // Tax fields (needed for order payload)
    cgst?: number;
    sgst?: number;
    igst?: number;
    vat?: number;
    sc?: number;
    pc?: number;
}

export interface CartState {
    cartItems: CartItem[];
}

const initialState: CartState = {
    cartItems: [],
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity' | 'localCartId'>>) => {
            const existingItem = state.cartItems.find(i =>
                i.itemId === action.payload.itemId &&
                i.customAttributeId === action.payload.customAttributeId
            );
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.cartItems.push({
                    ...action.payload,
                    quantity: 1,
                    localCartId: Math.random().toString(36).substr(2, 9)
                });
            }
        },
        addToCartWithOptions: (state, action: PayloadAction<{
            item: Omit<CartItem, 'quantity' | 'localCartId'>;
            quantity: number;
            remark?: string;
            addOns?: CartAddon[];
        }>) => {
            const { item, quantity, remark, addOns } = action.payload;
            const existingItem = state.cartItems.find(i =>
                i.itemId === item.itemId &&
                i.customAttributeId === item.customAttributeId &&
                !remark && !i.remark &&
                (!addOns || addOns.length === 0) &&
                (!i.addOns || i.addOns.length === 0)
            );
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                state.cartItems.push({
                    ...item,
                    quantity,
                    remark,
                    addOns,
                    localCartId: Math.random().toString(36).substr(2, 9)
                });
            }
        },
        decrementFromCart: (state, action: PayloadAction<number>) => {
            const existingItem = state.cartItems.find(i => i.itemId === action.payload);
            if (existingItem) {
                if (existingItem.quantity > 1) {
                    existingItem.quantity -= 1;
                } else {
                    state.cartItems = state.cartItems.filter(i => i.itemId !== action.payload);
                }
            }
        },
        removeFromCart: (state, action: PayloadAction<number>) => {
            state.cartItems = state.cartItems.filter(i => i.itemId !== action.payload);
        },
        updateQuantity: (state, action: PayloadAction<{ itemId: number, quantity: number }>) => {
            const item = state.cartItems.find(i => i.itemId === action.payload.itemId);
            if (item) {
                item.quantity = action.payload.quantity;
            }
        },
        setItemRemark: (state, action: PayloadAction<{ localCartId: string; remark: string }>) => {
            const item = state.cartItems.find(i => i.localCartId === action.payload.localCartId);
            if (item) {
                item.remark = action.payload.remark;
            }
        },
        clearCart: (state) => {
            state.cartItems = [];
        }
    },
});

export const {
    addToCart,
    addToCartWithOptions,
    decrementFromCart,
    removeFromCart,
    updateQuantity,
    setItemRemark,
    clearCart
} = cartSlice.actions;

export const selectCartItems = (state: RootState) => state.cart.cartItems;
export const selectCartSubtotal = (state: RootState) =>
    state.cart.cartItems.reduce((acc, item) => {
        const addonTotal = (item.addOns || []).reduce((a, addon) => a + addon.price * addon.quantity, 0);
        return acc + (item.price * item.quantity) + addonTotal;
    }, 0);

export const selectCartTotalWithTaxes = (state: RootState) => {
    return state.cart.cartItems.reduce((acc, item) => {
        const itemPrice = item.price * item.quantity;
        const cgst = (itemPrice * (item.cgst || 0)) / 100;
        const sgst = (itemPrice * (item.sgst || 0)) / 100;
        const igst = (itemPrice * (item.igst || 0)) / 100;
        const vat = (itemPrice * (item.vat || 0)) / 100;

        const addonTotal = (item.addOns || []).reduce((a, addon) => {
            const addonPrice = addon.price * addon.quantity;
            const a_cgst = (addonPrice * (addon.cgst || 0)) / 100;
            const a_sgst = (addonPrice * (addon.sgst || 0)) / 100;
            const a_igst = (addonPrice * (addon.igst || 0)) / 100;
            const a_vat = (addonPrice * (addon.vat || 0)) / 100;
            return a + addonPrice + a_cgst + a_sgst + a_igst + a_vat;
        }, 0);

        return acc + itemPrice + cgst + sgst + igst + vat + addonTotal;
    }, 0);
};

export default cartSlice.reducer;
