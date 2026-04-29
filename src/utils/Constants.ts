import { useAppSelector } from '../store/hooks';
import { selectDbName, selectIpAddress } from '../store/userSlice';

export const BASE_URL = 'nebula-services-1.6/';
export const CUSTOMER_DETAILS_REQUIRED = true;
export const LOCAL_IP = '192.168.10.161';

export const useEnvironment = () => {
    const ip = useAppSelector(selectIpAddress) || 'dev.godirekt.in'; // Fallback for dev
    const dbName = useAppSelector(selectDbName)?.toLowerCase() || 'demo';

    const apiBaseUrl = `https://${ip}/${BASE_URL}${dbName}/`;
    return { apiBaseUrl };
};

export const NETWORK_ERROR = "Please check your network or internet connection";
export const ACCESS_DENIED = 'Access Denied';
