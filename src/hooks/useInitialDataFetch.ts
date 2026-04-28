import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setAddOnCategories, setAddOnItems, setCategories, setMenuItems, setOrganisedMenuItems } from '../store/menuSlice';
import { selectBranchId } from '../store/userSlice';
import { NETWORK_ERROR, useEnvironment } from '../utils/Constants';
import { groupPortions, makeAPIRequest, organizeMenu } from '../utils/Helper';

export const useInitialDataFetch = () => {
    const dispatch = useAppDispatch();
    const branchId = useAppSelector(selectBranchId) || 0;
    const { apiBaseUrl } = useEnvironment();
    const [loading, setLoading] = useState<boolean>(false);

    const getPrinterStatus = async () => {
        // try {
        //     const url = 'http://192.168.10.176:7009/devourin-printing/v1/listprinters';
        //     const printerData = await makeAPIRequest(url, null, 'GET');
        // } catch (err) {
        //     console.log("Printer check skipped/failed");
        // }
    };

    // Fetch Categories
    const getCategories = async () => {
        const url = `${apiBaseUrl}getItemCategories`;
        const response = await makeAPIRequest(url, null, 'GET');
        if (response) {
            dispatch(setCategories(response));
            return response;
        }
        return [];
    };

    // Fetch Menu Items Grouped
    const getMenuItems = async (categoriesData: any) => {
        const url = `${apiBaseUrl}getmenubytypeandbranch?type=Dinein&id=${branchId}`;
        const response = await makeAPIRequest(url, null, "GET");
        if (response) {
            const groupedResult = groupPortions(response);
            dispatch(setMenuItems(groupedResult));
            const organized = organizeMenu(groupedResult, categoriesData);
            dispatch(setOrganisedMenuItems(organized));
        }
    };

    // Fetch Addon Items
    const getAddOnItems = async () => {
        const url = apiBaseUrl + `addonsbyordertypeandbranch?type=${'Dinein'}&id=${branchId}`;
        const response = await makeAPIRequest(url, null, 'GET');
        if (response) {
            dispatch(setAddOnItems(response));
        }
    };

    // Fetch Addon Categories
    const getAddOnCategories = async () => {
        const url = `${apiBaseUrl}getAddonCategories`;
        const response = await makeAPIRequest(url, null, 'GET');
        if (response) {
            dispatch(setAddOnCategories(response));
        }
    };

    // Initial setup orchestration
    const callInitialSetUpAPIAsync = async () => {
        setLoading(true);
        try {
            const categories = await getCategories();
            // Fetch menu, addons and addon categories in parallel
            await Promise.all([
                getMenuItems(categories),
                getAddOnItems(),
                getAddOnCategories(),
                getPrinterStatus()
            ]);
        } catch (error) {
            Toast.show({ text1: NETWORK_ERROR, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return { callInitialSetUpAPIAsync, loading };
};
