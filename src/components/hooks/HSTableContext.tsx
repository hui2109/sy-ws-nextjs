import {createContext, useContext} from "react";

export const HSTableContext = createContext<{
    refreshKey: number;
    refresh: () => void;
} | null>(null);

export function useHSTableContext() {
    const context = useContext(HSTableContext);
    if (!context) {
        throw new Error("useHSTableContext must be used within a HSTableContext");
    }
    return context;
}
