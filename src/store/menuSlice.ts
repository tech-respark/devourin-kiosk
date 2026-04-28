import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./index";

export interface MenuState {
    menuItems: any[];
    organisedMenuItems: any[];
    categories: any[];
    addOnItems: any[];
    addOnCategories: any[];
    itemImages: any;
}

const initialState: MenuState = {
    menuItems: [],
    organisedMenuItems: [],
    categories: [],
    addOnItems: [],
    addOnCategories: [],
    itemImages: {}
};

const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {
        setMenuItems: (state, action: PayloadAction<any[]>) => {
            state.menuItems = action.payload;
        },
        setCategories: (state, action: PayloadAction<any[]>) => {
            state.categories = action.payload;
        },
        setOrganisedMenuItems: (state, action: PayloadAction<any[]>) => {
            state.organisedMenuItems = action.payload;
        },
        setAddOnItems: (state, action: PayloadAction<any[]>) => {
            state.addOnItems = action.payload;
        },
        setAddOnCategories: (state, action: PayloadAction<any[]>) => {
            state.addOnCategories = action.payload;
        },
        setItemImages: (state, action: PayloadAction<any[]>) => {
            state.itemImages = action.payload;
        }
    },
});

export const {
    setMenuItems,
    setCategories,
    setOrganisedMenuItems,
    setAddOnItems,
    setAddOnCategories,
    setItemImages
} = menuSlice.actions;

export const selectMenuItems = (state: RootState) => state.menu.menuItems;
export const selectOrganisedMenuItems = (state: RootState) => state.menu.organisedMenuItems;
export const selectCategories = (state: RootState) => state.menu.categories;
export const selectAddOnItems = (state: RootState) => state.menu.addOnItems;
export const selectAddOnCategories = (state: RootState) => state.menu.addOnCategories;
export const selectItemImages = (state: RootState) => state.menu.itemImages;

export default menuSlice.reducer;
