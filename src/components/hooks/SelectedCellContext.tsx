import {createContext, Dispatch, SetStateAction} from "react";
import dayjs, {Dayjs} from "dayjs";

export interface IScheduleCellInfo {
    name: string;
    day: Dayjs;
    bans: string[] | undefined;
}

export const SelectedCellContext = createContext<{
    selectedCell: IScheduleCellInfo;
    setSelectedCell: Dispatch<SetStateAction<IScheduleCellInfo>>;
}>({
    selectedCell: {name: '', day: dayjs(), bans: undefined},
    setSelectedCell: () => {
    }
})