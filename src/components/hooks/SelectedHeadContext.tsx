import {createContext, Dispatch, SetStateAction, useContext} from "react";
import {IScheduleHeadInfo} from "@/components/tables/ScheduleTable/useScheduleTableData";

export const SelectedHeadContext = createContext<{
    selectedHead: IScheduleHeadInfo;
    setSelectedHead: Dispatch<SetStateAction<IScheduleHeadInfo>>;
} | null>(null);

export function useSelectedHeadContext() {
    const context = useContext(SelectedHeadContext);
    if (!context) {
        throw new Error("useSelectedHeadContext must be used within a SelectedHeadContext");
    }
    return context;
}