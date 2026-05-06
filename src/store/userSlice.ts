import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CustomerDetails {
    name: string;
    mobile: string;
    userId?: string | number;
    address?: any;
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
    applicationConfigs: any | null;
    lastSyncDate: string | null;
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
    applicationConfigs: null,
    lastSyncDate: null,
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
        setApplicationConfigs: (state, action: PayloadAction<any>) => {
            state.applicationConfigs = action.payload;
        },
        setLastSyncDate: (state, action: PayloadAction<string>) => {
            state.lastSyncDate = action.payload;
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
    setApplicationConfigs,
    setLastSyncDate,
    logoutStaff,
    resetUser,
} = userSlice.actions;

export const selectIpAddress = (state: any) => state.user.ipAddress;
export const selectDbName = (state: any) => state.user.dbName;
export const selectBranchId = (state: any) => state.user.branchId;
export const selectUserData = (state: any) => state.user.userData;
export const selectMobileSettings = (state: any) => state.user.mobileSettings;

export const selectMobileSetting = (key: string) => (state: any) => {
    const settings = state.user.mobileSettings;
    if (!settings) return null;
    if (Array.isArray(settings)) {
        return settings.find((s: any) => s.property === key)?.value;
    }
    return settings[key];
};

export const selectBranchConfigs = (state: any) => state.user.branchConfigs;

export const selectBranchConfig = (key: string) => (state: any) => {
    const configs = state.user.branchConfigs;
    if (!configs) return null;
    if (Array.isArray(configs)) {
        return configs.find((c: any) => c.property === key)?.value;
    }
    return configs[key];
};

export const selectTaxes = (state: any) => state.user.taxes;
export const selectCustomerDetails = (state: any) => state.user.customerDetails;
export const selectApplicationConfigs = (state: any) => state.user.applicationConfigs;
export const selectLastSyncDate = (state: any) => state.user.lastSyncDate;

export default userSlice.reducer;
