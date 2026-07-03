import {createContext, Dispatch, RefObject, SetStateAction, useContext} from "react";
import {Dayjs} from "dayjs";


export const ScheduleTableContext = createContext<{
    current: Dayjs;
    setCurrent: Dispatch<SetStateAction<Dayjs>>;
    refreshKey: number;
    refresh: () => void;
    scheduleTableRef: RefObject<HTMLDivElement | null>;
} | null>(null);

export function useScheduleTableContext() {
    const context = useContext(ScheduleTableContext);
    if (!context) {
        throw new Error("useCurrentDateContext must be used within a CurrentDateContext");
    }
    return context;
}
