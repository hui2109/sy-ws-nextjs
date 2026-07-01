import React, {useContext} from "react";
import {CurrentDateContext} from "@/components/hooks/CurrentDateContext";
import ClearTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/ClearTableModal/ClearTableModal";
import SubmitTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/SubmitTableModal/SubmitTableModal";
import AuditTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/AuditTableModal/AuditTableModal";
import CheckTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/CheckTableModal/CheckTableModal";
import ExportTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/ExportTableModal/ExportTableModal";

export default function ScheduleTableSideMenuModals() {
    const {current, refresh} = useContext(CurrentDateContext);

    return (
        <>
            <ClearTableModal current={current} refresh={refresh}/>
            <CheckTableModal current={current}/>
            <SubmitTableModal current={current} refresh={refresh}/>
            <AuditTableModal current={current} refresh={refresh}/>
            <ExportTableModal current={current}/>
        </>
    );
}