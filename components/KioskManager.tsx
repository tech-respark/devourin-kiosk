import React, { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { useDispatch } from 'react-redux';
import { clearCart } from '../src/store/cartSlice';
import { clearCustomerDetails } from '../src/store/userSlice';

const INACTIVITY_TIMEOUT = 120000; // 2 minutes

export const KioskManager: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useDispatch();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const resetSession = () => {
        // Don't reset if we are already on the landing, index, or order tracking pages
        if (pathname === '/mode' || pathname === '/' || pathname === '/login' || pathname === '/order-tracking') return;

        console.log("Inactivity detected. Resetting kiosk session...");
        dispatch(clearCart());
        dispatch(clearCustomerDetails());
        router.replace('/mode');
    };

    const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(resetSession, INACTIVITY_TIMEOUT);
    };

    useEffect(() => {
        if (Platform.OS !== 'web') return;

        // Global Inactivity Listeners
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('mousedown', resetTimer);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('touchstart', resetTimer);

        resetTimer();

        return () => {
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('mousedown', resetTimer);
            window.removeEventListener('keypress', resetTimer);
            window.removeEventListener('touchstart', resetTimer);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [pathname]);

    return <>{children}</>;
};
