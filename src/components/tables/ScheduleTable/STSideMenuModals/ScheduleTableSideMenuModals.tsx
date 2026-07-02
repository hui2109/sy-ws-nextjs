import React from "react";
import ClearTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/ClearTableModal/ClearTableModal";
import SubmitTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/SubmitTableModal/SubmitTableModal";
import AuditTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/AuditTableModal/AuditTableModal";

export default function ScheduleTableSideMenuModals() {
    return (
        <>
            <ClearTableModal/>
            {/* <CheckTableModal/> */}
            <SubmitTableModal/>
            <AuditTableModal/>
            {/* <ExportTableModal/> */}
        </>
    );
}