import {Button, Col, Row, Table} from "antd";
import React, {RefObject, useCallback, useRef, useState} from "react";
import useAllWorkTableData, {IWorkTableCellInfo} from "@/components/tables/AllWorkTable/useAllWorkTableData";
import {useCurrentContext} from "@/components/hooks/CurrentContext";
import DateJump from "@/components/others/DateJump";
import BanTypeInfoModal from "@/components/tables/AllWorkTable/BanTypeInfoModal/BanTypeInfoModal";
import OverviewTableModal from "@/components/tables/AllWorkTable/OverviewTableModal/OverviewTableModal";
import DownloadTableModal from "@/components/tables/AllWorkTable/DownloadTableModal/DownloadTableModal";
import {useAppContext} from "@/components/hooks/AppProvider";

export default function AllWorkTable() {
    const {resolvedViewport} = useAppContext();
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState<IWorkTableCellInfo | null>(null);
    const handleAllWorkTableCellClick = useCallback((info: IWorkTableCellInfo) => {
        setSelectedCell(info);
        setIsInfoModalOpen(true);
    }, []);
    const allWorkTableRef = useRef(null);
    const {dataSource, columns, loading} = useAllWorkTableData(handleAllWorkTableCellClick);

    return (
        <div ref={allWorkTableRef} className='max-desktop:px-3 max-desktop:pb-4'>
            <Table
                loading={loading}
                columns={columns}
                dataSource={dataSource}
                scroll={{x: 'max-content', y: 'calc(100dvh - 280px)'}}
                pagination={false}
                title={() => resolvedViewport === "mobile"
                    ? <AllWorkTableToolsMobile allWorkTableRef={allWorkTableRef}/>
                    : <AllWorkTableTools allWorkTableRef={allWorkTableRef}/>
                }
                footer={() => ''}
                column={{align: 'center'}}
                size={resolvedViewport === 'mobile' ? "small" : 'large'}
                bordered
                classNames={{
                    footer: '!p-2 max-desktop:!p-2',
                    title: '!p-3 max-desktop:!p-2',
                    header: {cell: 'max-desktop:!p-1'},
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

function AllWorkTableToolsMobile({allWorkTableRef}: { allWorkTableRef: RefObject<HTMLDivElement | null> }) {
    const {current, setCurrent} = useCurrentContext();
    const [isOverviewModalOpen, setIsOverviewModalOpen] = useState<boolean>(false);
    const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);

    return (
        <>
            <div className='flex items-center justify-between'>
                <Button
                    color="magenta"
                    variant="solid"
                    size="small"
                    onClick={() => setIsOverviewModalOpen(true)}
                    className={'!text-[12px] !p-0.5'}
                >
                    班种总览
                </Button>
                <DateJump
                    picker="month"
                    current={current}
                    setCurrent={setCurrent}
                />
                <Button
                    color="green"
                    variant="solid"
                    size="small"
                    onClick={() => setIsDownloadModalOpen(true)}
                    className={'!text-[12px] !p-0.5'}
                >
                    下载排班
                </Button>
            </div>

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