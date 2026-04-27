import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { RootState } from "./index";

export interface MenuState {
    menuItems: any[];
    organisedMenuItems: any[];
    categories: any[];
}

const initialState: MenuState = {
    menuItems: [],
    organisedMenuItems: [],
    categories: [],
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
    },
});

export const { setMenuItems, setCategories, setOrganisedMenuItems } = menuSlice.actions;

export const selectMenuItems = (state: RootState) => state.menu.menuItems;
export const selectOrganisedMenuItems = (state: RootState) => state.menu.organisedMenuItems;
export const selectCategories = (state: RootState) => state.menu.categories;

export default menuSlice.reducer;
