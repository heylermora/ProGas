import React, { createContext, useState, useCallback } from 'react';

interface OrderRefreshContextType {
    refreshKey: number;
    triggerRefresh: () => void;
}

export const OrderRefreshContext = createContext<OrderRefreshContextType | undefined>(undefined);

export const OrderRefreshProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [refreshKey, setRefreshKey] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    return (
        <OrderRefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
            {children}
        </OrderRefreshContext.Provider>
    );
};

export const useOrderRefresh = () => {
    const context = React.useContext(OrderRefreshContext);
    if (!context) {
        throw new Error('useOrderRefresh debe ser usado dentro de OrderRefreshProvider');
    }
    return context;
};
