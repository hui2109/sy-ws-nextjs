import {useEffect, useState} from "react";
import {getWSbyMonth, PersonDateBansMap} from "@/api/WorkSchedule/getWSbyMonth";
import {getTransformTableData} from "@/components/utils/getTransformTableData";
import {useCurrentContext} from "@/components/hooks/CurrentContext";

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

    if (!dbData) {
        return {dataSource: [], columns: [], loading};
    }

    return {...getTransformTableData(dbData, current), loading};
}