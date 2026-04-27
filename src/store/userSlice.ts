import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    ipAddress: string | null;
    dbName: string | null;
    branchId: string | null;
    userData: any | null;
    mobileSettings: any | null;
    branchConfigs: any | null;
    taxes: any | null;
}

const initialState: UserState = {
    ipAddress: null,
    dbName: null,
    branchId: null,
    userData: null,
    mobileSettings: null,
    branchConfigs: null,
    taxes: null,
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
        logoutStaff: (state) => {
            state.userData = null;
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
    logoutStaff,
} = userSlice.actions;

export const selectIpAddress = (state: any) => state.user.ipAddress;
export const selectDbName = (state: any) => state.user.dbName;
export const selectBranchId = (state: any) => state.user.branchId;
export const selectUserData = (state: any) => state.user.userData;
export const selectMobileSettings = (state: any) => state.user.mobileSettings;
export const selectBranchConfigs = (state: any) => state.user.branchConfigs;

export default userSlice.reducer;
