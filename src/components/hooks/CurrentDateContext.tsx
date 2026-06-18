import {createContext, Dispatch, SetStateAction} from "react";
import dayjs, {Dayjs} from "dayjs";


export const CurrentDateContext = createContext<{
    current: Dayjs;
    setCurrent: Dispatch<SetStateAction<Dayjs>>;
}>({
    current: dayjs(),
    setCurrent: () => {
    }
});
