import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./index";

export interface CartItem {
    itemId: number;
    localCartId?: string; // unique string for the instance in cart
    categoryId: string;
    name: string;
    price: number;
    isVeg: boolean;
    imageColor: string;
    quantity: number;
}

export interface CartState {
    cartItems: CartItem[];
    globalInstruction: string;
}

const initialState: CartState = {
    cartItems: [],
    globalInstruction: '',
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity' | 'localCartId'>>) => {
            const existingItem = state.cartItems.find(i => i.itemId === action.payload.itemId);
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
        setGlobalInstruction: (state, action: PayloadAction<string>) => {
            state.globalInstruction = action.payload;
        },
        clearCart: (state) => {
            state.cartItems = [];
            state.globalInstruction = '';
        }
    },
});

export const { addToCart, decrementFromCart, removeFromCart, updateQuantity, setGlobalInstruction, clearCart } = cartSlice.actions;

export const selectCartItems = (state: RootState) => state.cart.cartItems;
export const selectCartSubtotal = (state: RootState) => state.cart.cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
export const selectGlobalInstruction = (state: RootState) => state.cart.globalInstruction;

export default cartSlice.reducer;
