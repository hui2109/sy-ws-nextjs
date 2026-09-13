'use client';

import {Badge, DatePicker, Input, Select, Tag} from "antd";
import React, {useEffect, useState} from "react";
import {useAppContext} from "@/components/hooks/AppProvider";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import LeaveApplyShiftScheduleTable from "@/components/tables/LeaveApplyTab/LeaveApplyTables/LeaveApplyShiftScheduleTable";
import LeaveApplyAskOffOrChangeScheduleTable from "@/components/tables/LeaveApplyTab/LeaveApplyTables/LeaveApplyAskOffOrChangeScheduleTable";
import {leaveApplyStatusColorMap, leaveApplyStatusMap, leaveApplyTypeColorMap, leaveApplyTypeMap} from "@/configs/general";
import {IClickedLeaveApplyDetails} from "@/components/tables/LeaveApplyTab/LeaveApplyList";
import {LeaveApplyType} from "@/prisma/generated/enums";

const {TextArea} = Input;
const {RangePicker} = DatePicker;

interface ILeaveApplyFormLoad {
    clickedLeaveApplyDetails: IClickedLeaveApplyDetails
}

export default function LeaveApplyFormLoad({clickedLeaveApplyDetails}: ILeaveApplyFormLoad) {
    const {resolvedTheme, resolvedViewport} = useAppContext();
    const isDark = resolvedTheme === 'dark';
    const {status, leaveApplyType, dateRange, applyUser, targetStaff, reason, assignmentsJson, createdDate} = clickedLeaveApplyDetails;
    const [banTypeColorMap, setBanTypeColorMap] = useState<Record<string, string> | null>(null);

    const isShiftSchedule = leaveApplyType === 'SHIFT_SCHEDULE';
    const isAskOff = leaveApplyType === 'ASKOFF';

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

    if (!banTypeColorMap) return null;

    const labelCellClassName = isDark ? 'border-slate-700/80 bg-slate-800/50 text-slate-300' : 'border-slate-200 bg-slate-50/90 text-slate-600';
    const valueCellClassName = isDark ? 'border-slate-700/80 bg-slate-900/35' : 'border-slate-200 bg-white';

    return (
        <div className="space-y-5 max-desktop:space-y-3">
            <div className={`overflow-hidden rounded-2xl border shadow-sm transition-colors
                max-desktop:rounded-xl ${
                isDark
                    ? 'border-slate-700/80 bg-slate-900/70 shadow-black/20'
                    : 'border-slate-200 bg-white shadow-slate-200/70'
            }`}>
                <div className={`flex items-center justify-between gap-2 border-b px-5 py-4
                    max-desktop:flex-col max-desktop:items-start max-desktop:px-2 max-desktop:py-2 ${
                    isDark
                        ? 'border-slate-700/80 bg-slate-800/80'
                        : 'border-slate-200 bg-slate-50/90'}`}>
                    <div className="border-l-4 border-blue-500 pl-3">
                        <h3 className={`text-base font-semibold leading-6 ${
                            isDark ? 'text-slate-100' : 'text-slate-900'
                        }`}>
                            申请信息
                        </h3>
                    </div>
                    <div
                        className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${
                            isDark
                                ? 'border-slate-600 text-slate-300'
                                : 'border-slate-300 text-slate-600'
                        }`}
                    >
                        申请人：{applyUser}
                    </div>
                </div>
                <div className="p-5 max-desktop:p-2">
                    <div className={`overflow-hidden rounded-xl border ${isDark ? 'border-slate-700/80' : 'border-slate-200'}`}>
                        <div className="grid grid-cols-[150px_minmax(0,1fr)] max-desktop:grid-cols-[80px_minmax(0,1fr)]">
                            <div className={`flex min-h-[60px] items-center border-b border-r px-4 py-3 text-sm font-medium
                            max-desktop:min-h-[54px] max-desktop:px-3 max-desktop:py-2 max-desktop:text-[13px] ${labelCellClassName}`}>
                                申请状态
                            </div>
                            <div className={`flex items-center border-b px-4 py-2.5 max-desktop:px-2.5 max-desktop:py-2 ${valueCellClassName}`}>
                                <Tag
                                    color={leaveApplyStatusColorMap[status]}
                                    variant='solid'
                                    className='!text-sm !font-bold'
                                >
                                    {leaveApplyStatusMap[status]}
                                </Tag>
                            </div>

                            <div className={`flex min-h-[60px] items-center border-b border-r px-4 py-3 text-sm font-medium
                            max-desktop:min-h-[54px] max-desktop:px-3 max-desktop:py-2 max-desktop:text-[13px] ${labelCellClassName}`}>
                                申请类别
                            </div>
                            <div className={`flex items-center border-b px-4 py-2.5 max-desktop:px-2.5 max-desktop:py-2 ${valueCellClassName}`}>
                                <Select
                                    className="w-full max-w-[180px] text-center max-desktop:max-w-none"
                                    value={leaveApplyType}
                                    classNames={{popup: {listItem: 'text-center'}}}
                                    labelRender={(labelInValueType) => (
                                        <Badge
                                            count={leaveApplyTypeMap[labelInValueType.value as LeaveApplyType]}
                                            color={leaveApplyTypeColorMap[labelInValueType.value as LeaveApplyType]}
                                            classNames={{indicator: '!rounded-lg !font-bold'}}
                                        />
                                    )}
                                    disabled
                                />
                            </div>

                            <div className={`flex min-h-[60px] items-center border-b border-r px-4 py-3 text-sm font-medium max-desktop:min-h-[54px] max-desktop:px-3 max-desktop:py-2 max-desktop:text-[13px] ${labelCellClassName}`}>
                                日期范围
                            </div>
                            <div className={`flex items-center border-b px-4 py-2.5 max-desktop:px-2.5 max-desktop:py-2 ${valueCellClassName}`}>
                                <RangePicker
                                    format={resolvedViewport === 'mobile' ? 'YY/M/D' : 'YYYY-MM-DD'}
                                    className="w-full max-w-[350px] max-desktop:max-w-none"
                                    classNames={{input: 'text-center'}}
                                    value={dateRange}
                                    size={resolvedViewport === 'mobile' ? 'small' : 'middle'}
                                    disabled
                                />
                            </div>

                            <div className={`flex min-h-[60px] items-center border-b border-r px-4 py-3 text-sm font-medium
                            max-desktop:min-h-[54px] max-desktop:px-3 max-desktop:py-2 max-desktop:text-[13px] ${labelCellClassName}`}>
                                {isAskOff ? '请假人' : isShiftSchedule ? '换班对象' : '调整人员'}
                            </div>
                            <div className={`flex items-center border-b px-4 py-2.5 max-desktop:px-2.5 max-desktop:py-2 ${valueCellClassName}`}>
                                <Select
                                    className="w-full max-w-[180px] text-center max-desktop:max-w-none"
                                    value={isAskOff ? applyUser : targetStaff}
                                    classNames={{popup: {listItem: 'text-center'}}}
                                    disabled
                                />
                            </div>

                            <div className={`flex flex-col min-h-[170px] justify-center border-r px-4 py-3 text-sm font-medium
                            max-desktop:min-h-[150px] max-desktop:px-3 max-desktop:py-2 max-desktop:text-[13px] ${labelCellClassName}`}>
                                <div>申请理由</div>
                            </div>
                            <div className={`flex items-center px-4 pt-3 pb-5 max-desktop:px-2.5 ${valueCellClassName}`}>
                                <TextArea
                                    rows={5}
                                    value={reason}
                                    maxLength={800}
                                    showCount
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                {isShiftSchedule && (
                    <LeaveApplyShiftScheduleTable
                        personDateBansMap={assignmentsJson}
                        banTypeColorMap={banTypeColorMap}
                        dateRange={dateRange}
                        names={[applyUser, targetStaff]}
                    />
                )}

                {!isShiftSchedule && (
                    <LeaveApplyAskOffOrChangeScheduleTable
                        leaveApplyType={leaveApplyType}
                        personDateBansMap={assignmentsJson}
                        banTypeColorMap={banTypeColorMap}
                        dateRange={dateRange}
                        applyUser={applyUser}
                        targetStaff={targetStaff}
                        validBanNames={[]}
                        loadMode={true}
                    />
                )}
            </div>
            <div className={`mt-6 flex items-center justify-end gap-2 border-t px-1 pt-4 text-xs max-desktop:mt-4
             ${
                isDark
                    ? 'border-slate-700 text-slate-400'
                    : 'border-slate-200 text-slate-500'
            }`}>
                <span>
                    发起人：
                    <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                        {applyUser}
                    </span>
                </span>
                <span className="opacity-40">·</span>
                <span>
                    发起时间：
                    <span className={isDark ? 'text-slate-200' : 'text-slate-700'}>
                        {createdDate.format('YYYY/M/D HH:mm')}
                    </span>
                </span>
            </div>
        </div>
    );
}