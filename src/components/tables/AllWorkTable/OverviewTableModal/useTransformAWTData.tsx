import {useEffect, useState} from "react";
import {getWSbyMonth, PersonDateBansMap} from "@/api/WorkSchedule/getWSbyMonth";
import {getTransformTableData} from "@/components/utils/getTransformTableData";
import {useCurrentContext} from "@/components/hooks/CurrentContext";
import {ScheduleStatus} from "@/configs/general";

export default function useTransformAWTData() {
    const {current} = useCurrentContext();
    const [dbData, setDbData] = useState<PersonDateBansMap | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;

        const formatCurrDate = current.format('YYYY-MM-DD');
        getWSbyMonth(formatCurrDate, false).then(dbData => {
            if (isMounted) {
                setDbData(dbData);
                setLoading(false);
            }
        });
        return () => {
            isMounted = false;
            setLoading(true);
        };
    }, [current]);

    // 未发布的排班 不能查看
    if (!dbData || dbData.monthStatus !== ScheduleStatus.PUBLISHED) {
        return {dataSource: [], columns: [], loading};
    }

    return {...getTransformTableData(dbData, current), loading};
}