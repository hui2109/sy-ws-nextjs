import {createContext, Dispatch, SetStateAction, useContext} from "react";
import {Dayjs} from "dayjs";

export interface IScheduleCellInfo {
    name: string;
    day: Dayjs;
    bans: string[] | undefined;
}

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