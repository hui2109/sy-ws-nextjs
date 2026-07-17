import {Button, Table} from "antd";
import React, {RefObject, useCallback, useRef, useState} from "react";
import useAllWorkTableData, {IWorkTableCellInfo} from "@/components/tables/AllWorkTable/useAllWorkTableData";
import {useCurrentContext} from "@/components/hooks/CurrentContext";
import DateJump from "@/components/dateSelects/DateJump";
import BanTypeInfoModal from "@/components/tables/AllWorkTable/BanTypeInfoModal/BanTypeInfoModal";
import OverviewTableModal from "@/components/tables/AllWorkTable/OverviewTableModal/OverviewTableModal";
import DownloadTableModal from "@/components/tables/AllWorkTable/DownloadTableModal/DownloadTableModal";

export default function AllWorkTable() {
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState<IWorkTableCellInfo | null>(null);
    const handleAllWorkTableCellClick = useCallback((info: IWorkTableCellInfo) => {
        setSelectedCell(info);
        setIsInfoModalOpen(true);
    }, []);
    const allWorkTableRef = useRef(null);
    const {dataSource, columns, loading} = useAllWorkTableData(handleAllWorkTableCellClick);

    return (
        <div ref={allWorkTableRef}>
            <Table
                loading={loading}
                columns={columns}
                dataSource={dataSource}
                scroll={{x: 'max-content', y: 750}}
                pagination={false}
                title={() => <AllWorkTableTools allWorkTableRef={allWorkTableRef}/>}
                footer={() => ''}
                column={{align: 'center'}}
                size={'large'}
                bordered
                classNames={{
                    footer: '!p-2',
                    title: '!p-3',
                }}
            />
            <BanTypeInfoModal
                isModalOpen={isInfoModalOpen}
                onClose={() => {
                    setIsInfoModalOpen(false);
                }}
                selectedCell={selectedCell}
            />
        </div>
    )
}

function AllWorkTableTools({allWorkTableRef}: { allWorkTableRef: RefObject<HTMLDivElement | null> }) {
    const {current, setCurrent} = useCurrentContext();
    const [isOverViewModalOpen, setIsOverViewModalOpen] = useState<boolean>(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);

    return (
        <div className='flex justify-center items-center gap-2'>
            <DateJump picker={"month"} current={current} setCurrent={setCurrent}/>
            <Button
                color='magenta'
                variant='solid'
                size='small'
                onClick={() => setIsOverViewModalOpen(true)}
            >
                班种总览
            </Button>
            <Button
                color='green'
                variant='solid'
                size='small'
                onClick={() => setIsDownloadModalOpen(true)}
            >
                下载排班
            </Button>
            <OverviewTableModal
                isModalOpen={isOverViewModalOpen}
                onClose={() => {
                    setIsOverViewModalOpen(false);
                }}
            />
            <DownloadTableModal
                isModalOpen={isDownloadModalOpen}
                onClose={() => {
                    setIsDownloadModalOpen(false);
                }}
                allWorkTableRef={allWorkTableRef}
            />
        </div>
    );
}