import {createContext, Dispatch, SetStateAction, useContext} from "react";
import {IScheduleCellInfo} from "@/components/tables/ScheduleTable/useScheduleTableData";

export const SelectedCellContext = createContext<{
    selectedCell: IScheduleCellInfo;
    setSelectedCell: Dispatch<SetStateAction<IScheduleCellInfo>>;
} | null>(null);

export function useSelectedCellContext() {
    const context = useContext(SelectedCellContext);
    if (!context) {
        throw new Error("useSelectedCellContext must be used within a SelectedCellContext");
    }
    return context;
}