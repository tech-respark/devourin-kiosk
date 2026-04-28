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
        // Don't reset if we are already on the landing or index pages
        if (pathname === '/mode' || pathname === '/' || pathname === '/login') return;

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

        // 1. Browser Locks
        if (__DEV__) return;
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const handleKeyDown = (e: KeyboardEvent) => {
            // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J')) ||
                (e.ctrlKey && e.key === 'u')
            ) {
                e.preventDefault();
            }
        };

        window.addEventListener('contextmenu', handleContextMenu);
        window.addEventListener('keydown', handleKeyDown);

        // 2. Global Inactivity Listeners
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('mousedown', resetTimer);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('touchstart', resetTimer);

        resetTimer();

        return () => {
            window.removeEventListener('contextmenu', handleContextMenu);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('mousedown', resetTimer);
            window.removeEventListener('keypress', resetTimer);
            window.removeEventListener('touchstart', resetTimer);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [pathname]);

    return <>{children}</>;
};
