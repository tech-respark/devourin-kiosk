import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CustomerDetails {
    name: string;
    mobile: string;
}

interface UserState {
    ipAddress: string | null;
    dbName: string | null;
    branchId: string | null;
    userData: any | null;
    mobileSettings: any | null;
    branchConfigs: any | null;
    taxes: any | null;
    customerDetails: CustomerDetails | null;
}

const initialState: UserState = {
    ipAddress: null,
    dbName: null,
    branchId: null,
    userData: null,
    mobileSettings: null,
    branchConfigs: null,
    taxes: null,
    customerDetails: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setIpAddress: (state, action: PayloadAction<string>) => {
            state.ipAddress = action.payload;
        },
        setDbName: (state, action: PayloadAction<string>) => {
            state.dbName = action.payload;
        },
        setBranchId: (state, action: PayloadAction<string>) => {
            state.branchId = action.payload;
        },
        setUserData: (state, action: PayloadAction<any>) => {
            state.userData = action.payload;
        },
        setMobileSettings: (state, action: PayloadAction<any>) => {
            state.mobileSettings = action.payload;
        },
        setBranchConfigs: (state, action: PayloadAction<any>) => {
            state.branchConfigs = action.payload;
        },
        setTaxes: (state, action: PayloadAction<any>) => {
            state.taxes = action.payload;
        },
        setCustomerDetails: (state, action: PayloadAction<CustomerDetails>) => {
            state.customerDetails = action.payload;
        },
        clearCustomerDetails: (state) => {
            state.customerDetails = null;
        },
        logoutStaff: (state) => {
            state.userData = null;
        },
        resetUser: (state) => {
            state.dbName = null;
            state.branchId = null;
            state.userData = null;
            state.mobileSettings = null;
            state.branchConfigs = null;
            state.taxes = null;
            state.customerDetails = null;
        }
    },
});

export const {
    setIpAddress,
    setDbName,
    setBranchId,
    setUserData,
    setMobileSettings,
    setBranchConfigs,
    setTaxes,
    setCustomerDetails,
    clearCustomerDetails,
    logoutStaff,
    resetUser,
} = userSlice.actions;

export const selectIpAddress = (state: any) => state.user.ipAddress;
export const selectDbName = (state: any) => state.user.dbName;
export const selectBranchId = (state: any) => state.user.branchId;
export const selectUserData = (state: any) => state.user.userData;
export const selectMobileSettings = (state: any) => state.user.mobileSettings;
export const selectBranchConfigs = (state: any) => state.user.branchConfigs;
export const selectTaxes = (state: any) => state.user.taxes;
export const selectCustomerDetails = (state: any) => state.user.customerDetails;

export default userSlice.reducer;
