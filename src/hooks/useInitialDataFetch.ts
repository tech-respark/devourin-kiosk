import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setAddOnCategories, setAddOnItems, setCategories, setItemImages, setMenuItems, setOrganisedMenuItems } from '../store/menuSlice';
import { selectBranchId, setBranchConfigs, setMobileSettings } from '../store/userSlice';
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

    const getItemImages = async () => {
        const url = `${apiBaseUrl}itemimagesbybrsrc?br=${branchId}&src=SPARK`
        const response = await makeAPIRequest(url, null, "GET");
        if (response) {
            const output: any = Object.fromEntries(
                response.map((item: any) => [item.itemId, item.imgPath])
            );
            dispatch(setItemImages(output));
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

    const getMobileSettings = async () => {
        const url = apiBaseUrl + `mobileappsettings`;
        const response = await makeAPIRequest(url, null, "GET");
        if (!response?.length) return;
        const output = Object.fromEntries(
            response.map((item: any) => {
                const { setting, description, enable, value } = item;
                // if (setting === 'is_printing_enabled_for_mobile_qsr') {
                //     dispatch(setPrinterEnabled({ printerEnabled: enable && Platform.OS === 'android' }));
                // }
                switch (setting) {
                    case "currency_symbol":
                        return [setting, description];
                    case "mobile_maximum_dijit":
                        return [setting, enable ? description : 10];
                    case "mobile_minimum_dijit":
                        return [setting, enable ? description : 8];
                    default:
                        return [setting, enable];
                }
            })
        );
        dispatch(setMobileSettings(output));
    };

    const getBranchConfigs = async () => {
        const url = apiBaseUrl + `branchconfigs`;
        const response = await makeAPIRequest(url, null, "GET");
        if (response) {
            const filteredData = response.filter((item: { [key: string]: any }) => item.branchId === parseInt(branchId.toString()));
            dispatch(setBranchConfigs(filteredData));
        }
    };

    // Initial setup orchestration
    const callInitialSetUpAPIAsync = async () => {
        setLoading(true);
        try {
            const categories = await getCategories();
            await Promise.all([
                getMenuItems(categories),
                getAddOnItems(),
                getAddOnCategories(),
                getMobileSettings(),
                getBranchConfigs(),
                getItemImages()
            ]);
        } catch (error) {
            Toast.show({ text1: NETWORK_ERROR, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return { callInitialSetUpAPIAsync, loading };
};
