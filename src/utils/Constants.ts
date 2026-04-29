import { useAppSelector } from '../store/hooks';
import { selectDbName, selectIpAddress } from '../store/userSlice';

export const BASE_URL = 'nebula-services-1.6/';
export const CUSTOMER_DETAILS_REQUIRED = true;
export const LOCAL_IP = '192.168.10.161';

export const useEnvironment = () => {
    const ip = useAppSelector(selectIpAddress) || '3.6.57.139'; // Fallback for dev
    const dbName = useAppSelector(selectDbName)?.toLowerCase() || 'demo';

    // Check if it's a domain name (ends with .com, .in, etc.)
    const isDomainName = /\.(com|in|net|app|dev|org)$/i.test(ip || "");
    const protocol = isDomainName ? "https" : "http";
    // const port = isDomainName ? "3000" : "8080";

    // e.g. http://192.168.1.100:8080/nebula-services-1.6/demo/
    const apiBaseUrl = `${protocol}://${ip}/${BASE_URL}${dbName}/`;
    return { apiBaseUrl, isDomainName };
};

export const IP_DOMAIN_MAP: Record<string, string> = {
    "3.6.57.139": "dev.godirekt.in"
};

export const NETWORK_ERROR = "Please check your network or internet connection";
export const ACCESS_DENIED = 'Access Denied';
