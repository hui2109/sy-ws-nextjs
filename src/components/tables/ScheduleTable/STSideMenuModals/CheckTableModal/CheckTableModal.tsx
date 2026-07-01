import {Dayjs} from "dayjs";
import {useEffect, useState} from "react";
import {getWSbyMonth} from "@/api/WorkSchedule/getWSbyMonth";

export default function CheckTableModal({current}: { current: Dayjs }) {
    const [dbData, setDbData] = useState<Awaited<ReturnType<typeof getWSbyMonth>> | null>(null);

    useEffect(() => {
        let isMounted = true;
        const formatCurrDate = current.format('YYYY-MM-DD');

        getWSbyMonth(formatCurrDate).then(dbData => {
            if (isMounted) {
                setDbData(dbData);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [current]);

    if (!dbData) {
        return null;
    }


}