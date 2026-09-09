import React from "react";
import ClearTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/ClearTableModal/ClearTableModal";
import SubmitTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/SubmitTableModal/SubmitTableModal";
import AuditTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/AuditTableModal/AuditTableModal";
import CheckTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/CheckTableModal/CheckTableModal";
import {useSTSideMenuModalContext} from "@/components/hooks/STSideMenuModalContext";
import ExportTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/ExportTableModal/ExportTableModal";
import {useScheduleTableContext} from "@/components/hooks/ScheduleTableContext";
import {ScheduleStatusMap} from "@/configs/general";

export default function ScheduleTableSideMenuModals() {
    const {isModalOpen, modalKey} = useSTSideMenuModalContext();
    const {monthStatus} = useScheduleTableContext();

    if (!isModalOpen) return null;

    const canRender = monthStatus !== ScheduleStatusMap.PUBLISHED;

    switch (modalKey) {
        case 'qingkongpaiban':
            return (canRender && <ClearTableModal/>);
        case 'hechapaiban':
            return <CheckTableModal/>;
        case 'tijiaopaiban':
            return (canRender && <SubmitTableModal/>);
        case 'shenhepaiban':
            return (canRender && <AuditTableModal/>);
        case 'daochupaiban':
            return <ExportTableModal/>;
        default:
            return null;
    }
}