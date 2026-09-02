import {createContext, useContext} from "react";

export const LeaveApplyTabContext = createContext<{
    refreshKey: number;
    refresh: () => void;
} | null>(null);

export function useLeaveApplyTabContext() {
    const context = useContext(LeaveApplyTabContext);
    if (!context) {
        throw new Error("useLeaveApplyTabContext must be used within a LeaveApplyTabContext");
    }
    return context;
}
