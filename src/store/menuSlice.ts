import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./index";

export interface MenuState {
    organisedMenuItems: any[];
    categories: any[];
    addOnItems: any[];
    addOnCategories: any[];
    itemImages: any;
    rowMenuItems: any[];
}

const initialState: MenuState = {
    organisedMenuItems: [],
    categories: [],
    addOnItems: [],
    addOnCategories: [],
    itemImages: {},
    rowMenuItems: [],
};

const menuSlice = createSlice({
    name: 'menu',
    initialState,
    reducers: {
        setRowMenuItems: (state, action: PayloadAction<any[]>) => {
            state.rowMenuItems = action.payload;
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
        },
        resetMenu: (state) => {
            state.organisedMenuItems = [];
            state.categories = [];
            state.addOnItems = [];
            state.addOnCategories = [];
            state.itemImages = {};
            state.rowMenuItems = [];
        }
    },
});

export const {
    setCategories,
    setOrganisedMenuItems,
    setAddOnItems,
    setAddOnCategories,
    setItemImages,
    resetMenu,
    setRowMenuItems,
} = menuSlice.actions;

export const selectRowMenuItems = (state: RootState) => state.menu.rowMenuItems;
export const selectOrganisedMenuItems = (state: RootState) => state.menu.organisedMenuItems;
export const selectCategories = (state: RootState) => state.menu.categories;
export const selectAddOnItems = (state: RootState) => state.menu.addOnItems;
export const selectAddOnCategories = (state: RootState) => state.menu.addOnCategories;
export const selectItemImages = (state: RootState) => state.menu.itemImages;

export default menuSlice.reducer;
