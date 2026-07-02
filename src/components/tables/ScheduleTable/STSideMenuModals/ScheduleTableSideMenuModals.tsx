import React from "react";
import ClearTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/ClearTableModal/ClearTableModal";
import SubmitTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/SubmitTableModal/SubmitTableModal";
import AuditTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/AuditTableModal/AuditTableModal";
import CheckTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/CheckTableModal/CheckTableModal";
import {useSTSideMenuModalContext} from "@/components/hooks/STSideMenuModalContext";
import ExportTableModal from "@/components/tables/ScheduleTable/STSideMenuModals/ExportTableModal/ExportTableModal";

export default function ScheduleTableSideMenuModals() {
    const {isModalOpen, modalKey} = useSTSideMenuModalContext();

    if (!isModalOpen) {
        return null;
    }

    switch (modalKey) {
        case 'qingkongpaiban':
            return <ClearTableModal/>;
        case 'hechapaiban':
            return <CheckTableModal/>;
        case 'tijiaopaiban':
            return <SubmitTableModal/>;
        case 'shenhepaiban':
            return <AuditTableModal/>;
        case 'daochupaiban':
            return <ExportTableModal/>;
        default:
            return null;
    }
}