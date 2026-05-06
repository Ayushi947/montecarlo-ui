
import React, { createContext, useContext, useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

interface GuestContextType {
    guestId: string | null;
    fingerprint: string | null;
    isLoading: boolean;
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export function GuestProvider({ children }: { children: React.ReactNode }) {
    const [guestId, setGuestId] = useState<string | null>(null);
    const [fingerprint, setFingerprint] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initializeGuest = async () => {
            try {
                // 1. Get or Create Guest ID (Stored in LocalStorage)
                let storedGuestId = localStorage.getItem('montecarlo_guest_id');
                if (!storedGuestId) {
                    storedGuestId = crypto.randomUUID();
                    localStorage.setItem('montecarlo_guest_id', storedGuestId);
                }
                setGuestId(storedGuestId);

                // 2. Get Device Fingerprint
                const fp = await FingerprintJS.load();
                const result = await fp.get();
                setFingerprint(result.visitorId);
            } catch (error) {
                console.error('Failed to initialize guest context:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeGuest();
    }, []);

    return (
        <GuestContext.Provider value={{ guestId, fingerprint, isLoading }}>
            {children}
        </GuestContext.Provider>
    );
}

export function useGuest() {
    const context = useContext(GuestContext);
    if (context === undefined) {
        throw new Error('useGuest must be used within a GuestProvider');
    }
    return context;
}
