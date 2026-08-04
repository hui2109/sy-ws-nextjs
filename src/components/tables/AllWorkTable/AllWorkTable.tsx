import {Button, Col, Row, Table} from "antd";
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
    const [isOverviewModalOpen, setIsOverviewModalOpen] = useState<boolean>(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);

    return (
        <>
            <Row align="middle" justify='center'>
                {/* 左侧占位 */}
                <Col span={8}/>

                {/* 中间：严格居中 */}
                <Col span={8}>
                    <Row justify='center'>
                        <Col>
                            <DateJump
                                picker="month"
                                current={current}
                                setCurrent={setCurrent}
                            />
                        </Col>
                    </Row>
                </Col>

                {/* 右侧：按钮靠右 */}
                <Col span={8}>
                    <Row justify="end" align="middle" gutter={12}>
                        <Col>
                            <Button
                                color="magenta"
                                variant="solid"
                                size="small"
                                onClick={() => setIsOverviewModalOpen(true)}
                            >
                                班种总览
                            </Button>
                        </Col>

                        <Col>
                            <Button
                                color="green"
                                variant="solid"
                                size="small"
                                onClick={() => setIsDownloadModalOpen(true)}
                            >
                                下载排班
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <OverviewTableModal
                isModalOpen={isOverviewModalOpen}
                onClose={() => setIsOverviewModalOpen(false)}
            />

            <DownloadTableModal
                isModalOpen={isDownloadModalOpen}
                onClose={() => setIsDownloadModalOpen(false)}
                allWorkTableRef={allWorkTableRef}
            />
        </>
    );
}
