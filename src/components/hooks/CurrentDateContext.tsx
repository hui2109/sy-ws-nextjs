import {createContext, Dispatch, SetStateAction} from "react";
import dayjs, {Dayjs} from "dayjs";


export const CurrentDateContext = createContext<{
    current: Dayjs;
    setCurrent: Dispatch<SetStateAction<Dayjs>>;
    refreshKey: number;
    refresh: () => void;
}>({
    current: dayjs(),
    setCurrent: () => {
    },
    refreshKey: 0,
    refresh: () => {
    }
});
