import {getWSbyMonth, PersonDateBansMap} from "@/api/WorkSchedule/getWSbyMonth";
import {useEffect, useState} from "react";
import {useScheduleTableContext} from "@/components/hooks/ScheduleTableContext";
import {useSTSideMenuModalContext} from "@/components/hooks/STSideMenuModalContext";
import {getTransformTableData} from "@/components/utils/getTransformTableData";

export function useTransformSTData() {
    const {current} = useScheduleTableContext();
    const {modalKey} = useSTSideMenuModalContext();
    const [dbData, setDbData] = useState<PersonDateBansMap | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        if (modalKey !== 'hechapaiban') {
            return;
        }

        let isMounted = true;
        const formatCurrDate = current.format('YYYY-MM-DD');
        getWSbyMonth(formatCurrDate).then(dbData => {
            if (isMounted) {
                setDbData(dbData);
                setLoading(false);
            }
        });
        return () => {
            isMounted = false;
            setLoading(true);
        };
    }, [current, modalKey]);

    if (!dbData) {
        return {dataSource: [], columns: [], loading};
    }

    return {...getTransformTableData(dbData, current), loading};
}

