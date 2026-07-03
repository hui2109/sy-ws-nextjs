import type {ColumnsType} from 'antd/es/table';
import {getWSbyMonth} from "@/api/WorkSchedule/getWSbyMonth";
import {useEffect, useState} from "react";
import {useScheduleTableContext} from "@/components/hooks/ScheduleTableContext";
import {useSTSideMenuModalContext} from "@/components/hooks/STSideMenuModalContext";
import dayjs from "dayjs";
import {Weekdays} from "@/configs/general";
import {Badge, Popover} from "antd";

interface IBanTableRow {
    key: string;
    date: string;

    [banName: string]: string[] | string;
}

export function useTransformSTData() {
    const {current} = useScheduleTableContext();
    const {modalKey} = useSTSideMenuModalContext();
    const [dbData, setDbData] = useState<Awaited<ReturnType<typeof getWSbyMonth>> | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;
        if (modalKey !== 'hechapaiban') {
            return;
        }
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

    const {nameBansMap} = dbData;
    const dateSet = new Set<string>();
    const banDatePeopleMap: Record<string, Record<string, string[]>> = {};

    Object.keys(nameBansMap).forEach((personName) => {
        const dateMap = nameBansMap[personName];
        Object.keys(dateMap).forEach((date) => {
            dateSet.add(date);
            const banNames = dateMap[date];

            banNames.forEach((banName) => {
                if (!banDatePeopleMap[banName]) {
                    banDatePeopleMap[banName] = {};
                }
                if (!banDatePeopleMap[banName][date]) {
                    banDatePeopleMap[banName][date] = [];
                }
                banDatePeopleMap[banName][date].push(personName);
            });
        });
    });

    const sortedDateSet = Array.from(dateSet).sort();
    const sortedBanNames = Object.keys(banDatePeopleMap).sort();

    // 构建 dataSource
    const dataSource: IBanTableRow[] = sortedDateSet.map((date, index) => {
        const row: IBanTableRow = {
            key: String(index),
            date,
        };

        sortedBanNames.forEach((banName) => {
            row[banName] = banDatePeopleMap[banName]?.[date] || [];
        });

        return row;
    });

    // 构建 columns
    const columns: ColumnsType<IBanTableRow> = [
        {
            title: `${current.format('YYYY/M')}`,
            dataIndex: 'date',
            fixed: 'left',
            width: 60,
            render: (text: string) => {
                const currDate = dayjs(text);
                const xingqi = Weekdays[currDate.day()];
                return (
                    <div className='flex flex-col items-center justify-center gap-1 font-bold'>
                        <div>{currDate.date()}</div>
                        <div>{'(' + xingqi + ')'}</div>
                    </div>
                )
            },
        },
        ...sortedBanNames.map((banName) => ({
            title: banName,
            dataIndex: banName,
            render: (personNames: string[], record: IBanTableRow) => getPeopleBadge(personNames, record, banName),
        })),
    ];

    return {dataSource, columns, loading};
}

function getPeopleBadge(personNames: string[], record: IBanTableRow, banName: string) {
    const length = personNames.length;
    const currDate = dayjs(record.date);

    switch (length) {
        case 0:
            return <Badge count={'暂无排班'} color={'gray'} classNames={{indicator: '!rounded-lg !font-bold'}}/>
        case 1:
            return (
                <div className='flex flex-col items-center justify-center gap-1'>
                    <Badge count={'1人'} color={'blue'} classNames={{indicator: '!rounded-lg !font-bold'}}/>
                    <div>{personNames[0]}</div>
                </div>
            );
        case 2:
            return (
                <div className='flex flex-col items-center justify-center gap-1'>
                    <Badge count={'2人'} color={'green'} classNames={{indicator: '!rounded-lg !font-bold'}}/>
                    <div>{personNames[0]}</div>
                    <div>{personNames[1]}</div>
                </div>
            );
        case 3:
            return (
                <div className='flex flex-col items-center justify-center gap-1'>
                    <Badge count={'3人'} color={'gold'} classNames={{indicator: '!rounded-lg !font-bold'}}/>
                    <div>{personNames[0]}</div>
                    <div>{personNames[1]}</div>
                    <div>{personNames[2]}</div>
                </div>
            )
        default:
            const popTitle = (
                <div className={'font-bold bg-indigo-500 text-white p-3 rounded-tl-lg rounded-tr-lg text-center'}>
                    {`${currDate.format('YYYY年M月D日')} ${banName} 班的所有人员`}
                </div>
            );
            const popContent = (
                <div className={'px-3 pb-3'}>
                    {`${personNames.join('、')}`}
                </div>
            );

            return (
                <div className='flex flex-col items-center justify-center gap-1'>
                    <Badge count={`${length}人`} color={'magenta'} classNames={{indicator: '!rounded-lg !font-bold'}}/>
                    <div>{personNames[0]}</div>
                    <div>{personNames[1]}</div>
                    <div>{personNames[2]}</div>
                    <Popover
                        content={popContent}
                        title={popTitle}
                        trigger="click"
                        classNames={{
                            container: '!p-0',
                            root: '!max-w-[400px]'
                        }}
                    >
                        <Badge count={'等等'} color={'purple'} classNames={{indicator: '!rounded-lg !font-bold'}} style={{cursor: 'pointer'}}/>
                    </Popover>
                </div>
            )
    }
}
