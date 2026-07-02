import {createContext, Dispatch, SetStateAction, useContext} from "react";
import {Dayjs} from "dayjs";


export const CurrentDateContext = createContext<{
    current: Dayjs;
    setCurrent: Dispatch<SetStateAction<Dayjs>>;
    refreshKey: number;
    refresh: () => void;
} | null>(null);

export function useCurrentDateContext() {
    const context = useContext(CurrentDateContext);
    if (!context) {
        throw new Error("useCurrentDateContext must be used within a CurrentDateContext");
    }
    return context;
}
