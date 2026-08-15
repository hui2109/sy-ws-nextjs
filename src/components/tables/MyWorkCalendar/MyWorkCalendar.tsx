'use client';

import React, {useEffect, useState} from 'react';
import {Badge, Button, Calendar, Carousel, Flex, Select,} from 'antd';
import dayjs, {Dayjs} from 'dayjs';
import 'dayjs/locale/zh-cn';
import dayLocaleData from 'dayjs/plugin/localeData';
import {CellRenderInfo} from "@rc-component/picker/interface";
import getPersonAllWSbyNameMonth, {PersonAllWSDateBansNamesMap} from "@/api/WorkSchedule/getPersonAllWSbyNameMonth";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import BanBadge from "@/components/tables/MyWorkCalendar/BanBadge";
import {sortBanTypeList} from "@/components/utils/sortBanTypeList";
import BanTypeInfoModal from "@/components/tables/AllWorkTable/BanTypeInfoModal/BanTypeInfoModal";
import {IWorkTableCellInfo} from "@/components/tables/AllWorkTable/useAllWorkTableData";
import {useAppContext} from "@/components/hooks/AppProvider";

dayjs.extend(dayLocaleData);
dayjs.locale('zh-cn');

export default function MyWorkCalendar() {
    const {currentUser, resolvedTheme} = useAppContext();
    const isDark = resolvedTheme === 'dark';
    const [current, setCurrent] = useState<Dayjs>(dayjs());
    const [myWorkData, setMyWorkData] = useState<PersonAllWSDateBansNamesMap | null>(null);
    const [banTypeColorMap, setBanTypeColorMap] = useState<Record<string, string> | null>(null);
    const [monthsFetched, setMonthsFetched] = useState<Array<string>>([]);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [selectedCell, setSelectedCell] = useState<IWorkTableCellInfo | null>(null);

    useEffect(() => {
        let isMounted = true;

        getBanTypeColorMap().then(banTypeColorMap => {
            if (isMounted) {
                setBanTypeColorMap(banTypeColorMap);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (!currentUser) return;
        if (monthsFetched.includes(current.format('YYYY-MM'))) {
            return;
        }

        getPersonAllWSbyNameMonth(current.format('YYYY-MM-DD'), currentUser).then(r => {
            if (isMounted) {
                setMyWorkData(prev => {
                    if (!prev) return r;
                    return {
                        [currentUser]: {
                            ...prev[currentUser],
                            ...r[currentUser]
                        }
                    };
                });
                setMonthsFetched(prev => [...prev, current.format('YYYY-MM')]);
            }
        });

        return () => {
            isMounted = false;
        };
    }, [current, currentUser, monthsFetched]);

    if (!myWorkData || !banTypeColorMap || !currentUser) return;

    const fullCellRender = (value: Dayjs, info: CellRenderInfo<Dayjs>) => {
        // 解析班种数据
        const banPeopleMap: Record<string, string[]> | undefined = myWorkData[currentUser][value.format('YYYY-MM-DD')];
        const banNames = banPeopleMap ? sortBanTypeList(Object.keys(banPeopleMap)) : [];

        // value代表每一个单元格所处的日期
        const isToday = value.isSame(info.today, 'day');
        const isSelected = value.isSame(current, 'day');
        const isCurrentMonth = value.isSame(current, 'month');
        // const isWeekend = value.day() === 0 || value.day() === 6;

        const cellClassName = [
            'text-center relative flex min-h-[112px] flex-col overflow-hidden rounded-xl border p-2',
            'transition-all duration-200',
            isCurrentMonth
                ? isDark ? 'border-slate-700 hover:border-blue-500 hover:shadow-md' : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                : isDark ? 'border-transparent bg-slate-800/40 opacity-15' : 'border-transparent bg-slate-50/70 opacity-15',
            isSelected
                ? isDark ? '!border-blue-400' : '!border-blue-500'
                : '',
        ].join(' ');

        const dateClassName = [
            'flex h-8 min-w-8 items-center justify-center rounded-full px-2',
            'text-sm font-semibold transition-colors',
            isToday
                ? isSelected
                    ? isDark ? 'bg-green-500 text-white ring-1 ring-green-400' : 'bg-green-600 text-white ring-1 ring-green-300'
                    : isDark ? 'bg-green-900/40 text-green-300 ring-1 ring-green-700' : 'bg-green-100 text-green-700 ring-1 ring-green-300'
                : isSelected
                    ? isDark ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white'
                    : isDark ? 'text-slate-200' : 'text-gray-950'
            ,
        ].join(' ');

        return (
            <div className={cellClassName}>
                <div className="flex justify-center">
                    <div className={dateClassName}>
                        {value.date()}
                    </div>
                </div>

                <div className="mt-2 px-1">
                    {banNames.length > 0 ? (
                        <Carousel
                            draggable
                            infinite={banNames.length > 1}
                        >
                            {banNames.map(banName => (
                                <div key={banName}>
                                    <div className='flex items-center justify-center'>
                                        <BanBadge
                                            banName={banName}
                                            banColor={banTypeColorMap[banName]}
                                            names={banPeopleMap![banName]}
                                            currentUser={currentUser}
                                            current={value}
                                            setIsInfoModalOpen={setIsInfoModalOpen}
                                            setSelectedCell={setSelectedCell}
                                        />
                                    </div>
                                </div>
                            ))}
                        </Carousel>
                    ) : (
                        <Badge
                            count="暂无数据"
                            color="gray"
                            classNames={{
                                indicator: '!rounded-lg !font-bold',
                            }}
                        />
                    )}
                </div>

                {isToday && (
                    <span className={`absolute right-2 top-2 text-[10px] font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>今天</span>
                )}

                {banNames.length > 1 && (
                    <span className={`absolute right-2 top-2 text-[10px] font-medium ${isDark ? 'text-red-400' : 'text-red-600'}`}>{banNames.length} 个班!</span>
                )}
            </div>
        );
    };

    return (
        <div className={`overflow-hidden rounded-2xl border shadow-sm p-5 ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
            <Calendar
                value={current}
                onSelect={(date) => setCurrent(date)}
                fullCellRender={fullCellRender}
                classNames={{
                    content: `[&_thead_tr_th]:text-center [&_thead_tr_th]:!px-2 [&_thead_tr_th]:!font-bold ${isDark ? '[&_thead_tr_th]:!text-amber-400' : '[&_thead_tr_th]:!text-amber-600'}`
                }}
                headerRender={({value, onChange}) => {
                    // value代表被选中的日期
                    const year = value.year();
                    const month = value.month();

                    const yearOptions = Array.from({length: 20}, (_, i) => {
                        const optionYear = value.year() - 10 + i;
                        return {
                            label: `${optionYear} 年`,
                            value: optionYear,
                        };
                    });

                    const monthOptions = value
                        .locale('zh-cn')
                        .localeData()
                        .monthsShort()
                        .map((label, index) => ({
                            label,
                            value: index,
                        }));

                    return (
                        <div className={`mb-2 flex rounded-xl border p-5 items-center justify-between ${isDark ? 'border-slate-700 bg-slate-800/60' : 'border-slate-100 bg-slate-50/80'}`}>
                            <div>
                                <div className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                                    {value.format('YYYY 年 M 月')}
                                </div>
                                <div className={`mt-0.5 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {currentUser} 的个人排班表
                                </div>
                            </div>

                            <Flex gap={8} wrap>
                                <Button
                                    color="green"
                                    variant='solid'
                                    onClick={() => setCurrent(dayjs())}
                                >
                                    回到今天
                                </Button>
                                <Select
                                    className="w-28"
                                    value={year}
                                    options={yearOptions}
                                    onChange={(newYear) => {
                                        const nextValue = value
                                            .clone()
                                            .year(newYear);
                                        onChange(nextValue);
                                    }}
                                    classNames={{popup: {listItem: 'text-center'}}}
                                />

                                <Select
                                    className="w-24"
                                    value={month}
                                    options={monthOptions}
                                    onChange={(newMonth) => {
                                        const nextValue = value
                                            .clone()
                                            .month(newMonth);
                                        onChange(nextValue);
                                    }}
                                    classNames={{popup: {listItem: 'text-center'}}}
                                />
                            </Flex>
                        </div>
                    );
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
    );
}
