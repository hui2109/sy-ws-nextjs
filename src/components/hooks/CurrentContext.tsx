import {createContext, Dispatch, SetStateAction, useContext} from "react";
import {Dayjs} from "dayjs";

interface ICurrentContext {
    current: Dayjs;
    setCurrent: Dispatch<SetStateAction<Dayjs>>;
}

export const CurrentContext = createContext<ICurrentContext | null>(null);

export function useCurrentContext() {
    const context = useContext(CurrentContext);
    if (!context) {
        throw new Error("useCurrentDateContext must be used within a CurrentDateContext");
    }
    return context;
}