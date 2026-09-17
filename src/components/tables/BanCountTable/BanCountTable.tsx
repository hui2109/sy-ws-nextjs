'use client';

import useBanCountTableData from "@/components/tables/BanCountTable/useBanCountTableData";
import {Select, Table} from "antd";
import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import dayjs from "dayjs";
import {getValidStaff} from "@/api/Person/getValidStaff";
import {useAppContext} from "@/components/hooks/AppProvider";
import {compareName} from "@/components/utils/compareDefaultRuleData";

interface IBanCountTableTools {
    currentYear: number;
    setCurrentYear: Dispatch<SetStateAction<number>>;
    currentStaff: string | null;
    setCurrentStaff: Dispatch<SetStateAction<string | null>>;
    validStaffs: string[];
}

export default function BanCountTable() {
    const {currentUser, resolvedViewport} = useAppContext();
    const [currentYear, setCurrentYear] = useState<number>(dayjs().year());
    const [currentStaff, setCurrentStaff] = useState<string | null>(currentUser);
    const [validStaffs, setValidStaffs] = useState<string[] | null>(null);

    const {dataSource, columns, loading} = useBanCountTableData(currentStaff, currentYear);

    useEffect(() => {
        let isMounted = true;

        getValidStaff().then(validStaffs => {
            if (isMounted) {
                setValidStaffs(validStaffs);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    if (!validStaffs) return null;

    return (
        <div className='max-desktop:px-3 max-desktop:pb-3'>
            <Table
                loading={loading}
                column={{align: 'center'}}
                columns={columns}
                dataSource={dataSource}
                scroll={{x: 'max-content', y: `calc(100dvh - ${resolvedViewport === "mobile" ? 270 : 340}px)`}}
                pagination={false}
                title={() => (
                    <div className="flex flex-col justify-center">
                        <div className="text-center text-2xl text-blue-600 font-bold mb-1 max-desktop:text-lg">
                            年度班次统计表
                        </div>
                        <BanCountTableTools
                            currentYear={currentYear}
                            setCurrentYear={setCurrentYear}
                            currentStaff={currentStaff}
                            setCurrentStaff={setCurrentStaff}
                            validStaffs={validStaffs}
                        />
                    </div>
                )}
                footer={() => ''}
                size={resolvedViewport === 'mobile' ? "small" : 'large'}
                bordered
                classNames={{
                    footer: '!p-2',
                    title: '!p-3 max-desktop:!p-2',
                    body: {cell: 'max-desktop:!p-2.5'}
                }}
                className='rounded-lg overflow-hidden'
            />
        </div>
    );
}

function BanCountTableTools({currentYear, setCurrentYear, currentStaff, setCurrentStaff, validStaffs}: IBanCountTableTools) {
    const {resolvedViewport} = useAppContext();
    const yearOptions = Array.from({length: 20},
        (_, i) => {
            const optionYear = currentYear - 10 + i;
            return {
                label: `${optionYear} 年`,
                value: optionYear,
            };
        });
    const targetStaffOptions = validStaffs.map(staff => ({
        label: staff,
        value: staff,
    }));

    return (
        <div className='flex justify-end items-center gap-1'>
            <Select
                size={resolvedViewport === 'mobile' ? "small" : 'middle'}
                className="w-full max-w-[120px] text-center max-desktop:max-w-[100px]"
                value={currentYear}
                options={yearOptions}
                onChange={newYear => setCurrentYear(newYear)}
                classNames={{
                    popup: {listItem: 'text-center'},
                    root: '!py-0.5'
                }}
            />
            <Select
                size={resolvedViewport === 'mobile' ? "small" : 'middle'}
                className="w-full max-w-[120px] text-center max-desktop:max-w-[100px]"
                value={currentStaff}
                onChange={newStaff => setCurrentStaff(newStaff)}
                options={targetStaffOptions}
                showSearch={resolvedViewport === 'mobile' ? false : {
                    optionFilterProp: 'value',
                    filterSort: (optionA, optionB) => compareName(optionA.value, optionB.value)
                }}
                classNames={{
                    popup: {listItem: 'text-center'},
                    root: '!py-0.5'
                }}
            />
        </div>
    )
}