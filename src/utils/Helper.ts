import Toast from "react-native-toast-message";
import { store } from "../store";

const getHeaders = (options: RequestInit = {}) => {
    const state = store.getState();
    return {
        "app": state.user.dbName ?? '',
        "br": state.user.branchId ?? '',
        ...(options.headers || {}),
    }
};

export const makeAPIRequestWithErrorHandling = async (
    url: string,
    body: any,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    headers: RequestInit = {},
    showToast: boolean = true
) => {
    try {
        const fetchOptions: RequestInit = {
            method,
            ...headers,
            headers: getHeaders(headers)
        };

        if (body && (method === "POST" || method === "PUT")) {
            fetchOptions.body = JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);
        const data = await response.json();

        if (response.ok) {
            return { error: false, statusCode: response.status, data };
        } else {
            if (showToast) Toast.show({ type: 'error', text1: data?.message || "API Error" });
            return { error: true, statusCode: response.status, message: data?.message };
        }
    } catch (error: any) {
        if (showToast) Toast.show({ type: 'error', text1: "Network Request Failed" });
        return { error: true, statusCode: 500, message: error.message };
    }
};

export const makeAPIRequest = async (
    url: string,
    body: any,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    headers: RequestInit = {},
    customErrorMsg?: string,
    showToast: boolean = true,
    signal?: AbortSignal,
    parseJson: boolean = true
) => {
    try {
        const fetchOptions: RequestInit = {
            method,
            signal,
            ...headers,
            headers: getHeaders(headers)
        };

        if (body && (method === "POST" || method === "PUT")) {
            if (body instanceof FormData) {
                fetchOptions.body = body;
            } else {
                fetchOptions.body = JSON.stringify(body);
            }
        }
        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
            console.log(url)
            if (showToast) Toast.show({ type: 'error', text1: customErrorMsg || "API Request Failed" });
            return null;
        }

        if (parseJson) {
            return await response.json();
        }
        return response;
    } catch (error: any) {
        if (error.name !== 'AbortError' && showToast) {
            Toast.show({ type: 'error', text1: "Network Error" });
        }
        return null;
    }
};

export interface MenuSubCategory {
    id: number | string;
    title: string;
    items: any[];
}

export interface MenuCategoryType {
    id: number | string;
    title: string;
    subcategories: MenuSubCategory[];
    items: any[];
}

export const groupPortions = (items: any[]) => {
    const map = new Map<number, any[]>();
    items.forEach(item => {
        if (!map.has(item.itemId)) map.set(item.itemId, []);
        const existing = map.get(item.itemId);
        if (existing) {
            existing.push(item);
        }
    });
    const result: any[] = [];
    map.forEach(rawItems => {
        if (rawItems.length === 1) {
            result.push(rawItems[0]);
        } else {
            const base = { ...rawItems[0] };
            const portions = rawItems.map(r => ({
                attributeName: r.attributeName,
                price: r.price,
                salePrice: r.salePrice,
                customAttributeId: r.customAttributeId
            })).sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
            result.push({ ...base, portions });
        }
    });
    return result;
};

export const organizeMenu = (groupedItems: any[], categories: any[]) => {
    const parentCats = categories.filter(c => c.parentCategory === 0).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    const suCats = categories.filter(c => c.parentCategory !== 0);
    const menu: MenuCategoryType[] = [];
    parentCats.forEach(parent => {
        const childSubCats = suCats.filter(s => s.parentCategory === parent.itemCategoryId).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
        const parentNode: MenuCategoryType = {
            id: parent.itemCategoryId,
            title: parent.itemCategoryName,
            subcategories: [],
            items: []
        };
        if (childSubCats.length > 0) {
            childSubCats.forEach(sub => {
                const subItems = groupedItems.filter(it => it.categoryId === sub.itemCategoryId);
                if (subItems.length > 0) {
                    parentNode.subcategories.push({
                        id: sub.itemCategoryId,
                        title: sub.itemCategoryName,
                        items: subItems.sort((a, b) => (a.index ?? 0) - (b.index ?? 0)),
                    })
                }
            });
            if (parentNode.subcategories.length > 0) {
                menu.push(parentNode);
            }
        } else {
            const parentItems = groupedItems.filter(i => i.categoryId === parent.itemCategoryId);
            if (parentItems.length > 0) {
                parentNode.items = parentItems.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
                menu.push(parentNode);
            }
        }
    })
    return menu;
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const checkBranchValidity = async (apiBaseUrl: string, branchId: string | number) => {
    const url = `${apiBaseUrl}isexpired`;
    const headers: any = { headers: { 'Content-Type': "application/json", br: branchId, src: 'Kiosk' } };
    const response = await makeAPIRequest(url, null, 'POST', headers, 'Branch verification failed', false);

    // In our simplified kiosk version, if we get a response it means it's not 401/412
    if (response) {
        return true;
    }
    return false;
};
