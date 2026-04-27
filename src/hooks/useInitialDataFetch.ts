import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setCategories, setMenuItems, setOrganisedMenuItems } from '../store/menuSlice';
import { selectBranchId } from '../store/userSlice';
import { NETWORK_ERROR, useEnvironment } from '../utils/Constants';
import { groupPortions, makeAPIRequest, organizeMenu } from '../utils/Helper';

export const useInitialDataFetch = () => {
    const dispatch = useAppDispatch();
    const branchId = useAppSelector(selectBranchId) || 0;
    const { apiBaseUrl } = useEnvironment();
    const [loading, setLoading] = useState<boolean>(false);

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

    // Initial setup orchestration
    const callInitialSetUpAPIAsync = async (restrictiveApps?: any) => {
        setLoading(true);
        try {
            const categories = await getCategories();
            await getMenuItems(categories);
        } catch (error) {
            Toast.show({ text1: NETWORK_ERROR, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return { callInitialSetUpAPIAsync, loading };
};
