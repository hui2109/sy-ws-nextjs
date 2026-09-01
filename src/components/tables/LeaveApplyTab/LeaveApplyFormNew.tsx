'use client';

import {Button, DatePicker, Input, Select, Tag} from "antd";
import {useEffect, useState} from "react";
import dayjs, {Dayjs} from "dayjs";
import {getValidStaff} from "@/api/Person/getValidStaff";
import getValidBanNames from "@/api/BanType/getValidBanNames";
import {sortBanTypeList} from "@/components/utils/sortBanTypeList";
import {useAppContext} from "@/components/hooks/AppProvider";
import {getWSbyNameDates} from "@/api/WorkSchedule/getWSbyNameDates";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import LeaveApplyShiftScheduleTable from "@/components/tables/LeaveApplyTab/LeaveApplyTables/LeaveApplyShiftScheduleTable";
import LeaveApplyAskOffOrChangeScheduleTable from "@/components/tables/LeaveApplyTab/LeaveApplyTables/LeaveApplyAskOffOrChangeScheduleTable";
import {SaveOutlined, SendOutlined} from "@ant-design/icons";
import createLeaveApply from "@/api/LeaveApply/createLeaveApply";
import {leaveApplyStatusColorMap, leaveApplyTypeMap} from "@/configs/general";
import {LeaveApplyType} from "@/prisma/generated/enums";
import getDatesBetween from "@/components/utils/getDatesBetween";

const {TextArea} = Input;
const {RangePicker} = DatePicker;

type IBanAssignment = [banName: string, scheduleAssignmentId: number];
type IDateBansMap = Record<string, IBanAssignment[]>;
type LeaveApplySaveStatus = 'PENDING_REVIEW' | 'DRAFT';
export type IPersonDateBansMap = Record<string, IDateBansMap>;

export default function LeaveApplyFormNew() {
    const {currentUser, resolvedTheme, notification} = useAppContext();
    const isDark = resolvedTheme === 'dark';
    const [leaveApplyType, setLeaveApplyType] = useState<null | LeaveApplyType>(null);
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>([dayjs(), dayjs().add(4, 'day')]);
    const [targetStaff, setTargetStaff] = useState<string | null>(null);
    const [reason, setReason] = useState<string>('');
    const [personDateBansMap, setPersonDateBansMap] = useState<IPersonDateBansMap | null>(null);
    const [validStaffs, setValidStaffs] = useState<string[] | null>(null);
    const [validBanNames, setValidBanNames] = useState<string[] | null>(null);
    const [banTypeColorMap, setBanTypeColorMap] = useState<Record<string, string> | null>(null);

    const isShiftSchedule = leaveApplyType === 'SHIFT_SCHEDULE';
    const isAskOff = leaveApplyType === 'ASKOFF';
    const completeDateRange = dateRange?.[0] && dateRange?.[1]
        ? [dateRange[0], dateRange[1]] as [Dayjs, Dayjs]
        : null;

    useEffect(() => {
        let isMounted = true;

        Promise.all([
            getValidStaff(),
            getValidBanNames(),
            getBanTypeColorMap(),
        ]).then(([validStaffs, validBanNames, banTypeColorMap]) => {
            if (isMounted) {
                setValidStaffs(validStaffs);
                setValidBanNames(sortBanTypeList(validBanNames));
                setBanTypeColorMap(banTypeColorMap);
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        let isMounted = true;

        if (!dateRange?.[0] || !dateRange?.[1]) return;

        const startDate = dateRange[0].format('YYYY-MM-DD');
        const endDate = dateRange[1].format('YYYY-MM-DD');
        const names = [...new Set([currentUser, targetStaff].filter(Boolean))] as string[];
        Promise.all(
            names.map(async name => [
                name,
                await getWSbyNameDates(name, startDate, endDate),
            ] as const)
        ).then(results => {
            if (!isMounted) return;

            setPersonDateBansMap(prev => {
                const safePrev = prev ?? {};
                const newData = {...safePrev};

                for (const [name, dateBansMap] of results) {
                    // 这个每次都更新
                    newData[name] = dateBansMap;
                    const tempKey = `${name}_`;
                    // 只有原来的 state 里没有 name_，才初始化它
                    if (!Object.hasOwn(safePrev, tempKey)) {
                        newData[tempKey] = Object.fromEntries(
                            Object.keys(dateBansMap).map(date => [date, []])
                        );
                    }
                }

                return newData;
            });
        });

        return () => {
            isMounted = false;
        };
    }, [currentUser, targetStaff, dateRange]);


    function handleCreateLeaveApply(status: LeaveApplySaveStatus) {
        if (!personDateBansMap || !leaveApplyType || !completeDateRange || !currentUser) return null;

        const [startDate, endDate] = completeDateRange;
        const start_date = startDate.format('YYYY-MM-DD');
        const end_date = endDate.format('YYYY-MM-DD');

        const isDraft = status === 'DRAFT';
        const actionText = isDraft ? '保存' : '提交';
        const successUser = leaveApplyType !== 'CHANGE_SCHEDULE' ? currentUser : targetStaff;
        const successStatusText = isDraft ? '草稿' : '待审核';

        createLeaveApply(
            leaveApplyType,
            start_date,
            end_date,
            reason,
            currentUser,
            targetStaff,
            personDateBansMap,
            status,
        ).then(r => {
            if (!r) {
                notification.error({
                    title: `假期申请 ${actionText}失败`,
                    description: `${leaveApplyTypeMap[leaveApplyType]} 申请${actionText}失败! 原因: 不存在当前用户! `
                });
            } else {
                notification.success({
                    title: `假期申请 ${actionText}成功`,
                    description: `${successUser} 的 ${leaveApplyTypeMap[leaveApplyType]} 申请${actionText}成功! 当前状态: ${successStatusText}!`
                });
            }
        })
    }

    function hasDateBans(name: string | null | undefined) {
        if (!name || !personDateBansMap?.[name] || !completeDateRange) {
            return false;
        }

        const dateBansMap = personDateBansMap[name];
        if (Object.keys(dateBansMap).length === 0) return false;

        return getDatesBetween(...completeDateRange).some(
            day => Boolean(dateBansMap[day.format('YYYY-MM-DD')])
        );
    }

    function hasRequiredDateBans() {
        switch (leaveApplyType) {
            case 'SHIFT_SCHEDULE':
                return hasDateBans(currentUser) && hasDateBans(targetStaff);
            case 'ASKOFF':
                return hasDateBans(currentUser) && hasDateBans(`${currentUser}_`);
            case 'CHANGE_SCHEDULE':
                return hasDateBans(targetStaff) && hasDateBans(`${targetStaff}_`);
            default:
                return false;
        }
    }

    function handleLeaveApplyTypeChange(value: LeaveApplyType) {
        if (value === 'SHIFT_SCHEDULE' && targetStaff === currentUser) {
            setTargetStaff(null);
        }
        setLeaveApplyType(value);
    }

    const targetStaffOptions = validStaffs
        ?.filter(staff => !isShiftSchedule || staff !== currentUser)
        .map(staff => ({
            label: staff,
            value: staff,
        }));

    const shiftScheduleTableProps = (
        isShiftSchedule
        && currentUser
        && targetStaff
        && personDateBansMap
        && banTypeColorMap
        && completeDateRange
    ) ? {
        personDateBansMap,
        banTypeColorMap,
        dateRange: completeDateRange,
        names: [currentUser, targetStaff] as [string, string],
    } : null;

    const askOffOrChangeScheduleTableProps = (
        leaveApplyType
        && !isShiftSchedule
        && currentUser
        && personDateBansMap
        && banTypeColorMap
        && completeDateRange
        && validBanNames
        && (isAskOff || targetStaff)
    ) ? {
        leaveApplyType,
        personDateBansMap,
        setPersonDateBansMap,
        banTypeColorMap,
        dateRange: completeDateRange,
        currentUser,
        targetStaff,
        validBanNames,
    } : null;

    const canShowActions = Boolean(
        leaveApplyType
        && personDateBansMap
        && completeDateRange
        && currentUser
        && reason.trim() !== ''
        && hasRequiredDateBans()
    );

    const labelCellClassName = isDark ? 'border-slate-700/80 bg-slate-800/50 text-slate-300' : 'border-slate-200 bg-slate-50/90 text-slate-600';
    const valueCellClassName = isDark ? 'border-slate-700/80 bg-slate-900/35' : 'border-slate-200 bg-white';

    return (
        <div className="space-y-5">
            <div className={`overflow-hidden rounded-2xl border shadow-sm transition-colors ${
                isDark
                    ? 'border-slate-700/80 bg-slate-900/70 shadow-black/20'
                    : 'border-slate-200 bg-white shadow-slate-200/70'
            }`}>
                <div className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${
                    isDark
                        ? 'border-slate-700/80 bg-slate-800/80'
                        : 'border-slate-200 bg-slate-50/90'}`}>
                    <div className="border-l-4 border-blue-500 pl-3">
                        <h3 className={`text-base font-semibold leading-6 ${
                            isDark ? 'text-slate-100' : 'text-slate-900'
                        }`}>
                            申请信息
                        </h3>
                        <p className={`mt-0.5 text-xs leading-5 ${
                            isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                            请先填写申请内容，下方明细会根据 申请类别 和 日期范围 自动生成
                        </p>
                    </div>
                    <div
                        className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${
                            isDark
                                ? 'border-slate-600 text-slate-300'
                                : 'border-slate-300 text-slate-600'
                        }`}
                    >
                        申请人：{currentUser || 'XXX'}
                    </div>
                </div>
                <div className="p-5">
                    <div className={`overflow-hidden rounded-xl border ${isDark ? 'border-slate-700/80' : 'border-slate-200'}`}>
                        <div className="grid grid-cols-[150px_minmax(0,1fr)]">
                            <div className={`flex min-h-[60px] items-center border-b border-r px-4 py-3 text-sm font-medium ${labelCellClassName}`}>
                                申请状态
                            </div>
                            <div className={`flex items-center border-b px-4 py-2.5 ${valueCellClassName}`}>
                                <Tag
                                    color={leaveApplyStatusColorMap.DRAFT}
                                    variant='solid'
                                    className='!text-sm !font-bold'
                                >
                                    草稿
                                </Tag>
                            </div>

                            <div className={`flex min-h-[60px] items-center border-b border-r px-4 py-3 text-sm font-medium ${labelCellClassName}`}>
                                申请类别
                            </div>
                            <div className={`flex items-center border-b px-4 py-2.5 ${valueCellClassName}`}>
                                <Select
                                    className="w-full max-w-[180px] text-center"
                                    placeholder="请选择申请类别"
                                    value={leaveApplyType}
                                    onChange={handleLeaveApplyTypeChange}
                                    options={Object.entries(leaveApplyTypeMap).map(
                                        ([value, label]) => ({
                                            value: value as LeaveApplyType,
                                            label,
                                        }),
                                    )}
                                    classNames={{popup: {listItem: 'text-center'}}}
                                />
                            </div>

                            <div className={`flex min-h-[60px] items-center border-b border-r px-4 py-3 text-sm font-medium ${labelCellClassName}`}>
                                日期范围
                            </div>
                            <div className={`flex items-center border-b px-4 py-2.5 ${valueCellClassName}`}>
                                <RangePicker
                                    className="w-full max-w-[350px]"
                                    value={dateRange}
                                    onChange={dates => setDateRange(dates)}
                                />
                            </div>

                            <div className={`flex min-h-[60px] items-center border-b border-r px-4 py-3 text-sm font-medium ${labelCellClassName}`}>
                                {isShiftSchedule ? '换班对象' : isAskOff ? '请假人' : '调整人员'}
                            </div>
                            <div className={`flex items-center border-b px-4 py-2.5 ${valueCellClassName}`}>
                                {isAskOff
                                    ? <Select
                                        className="w-full max-w-[180px] text-center"
                                        value={currentUser}
                                        classNames={{popup: {listItem: 'text-center'}}}
                                        disabled
                                    />
                                    : <Select
                                        className="w-full max-w-[180px] text-center"
                                        loading={!validStaffs}
                                        placeholder="请选择人员"
                                        value={targetStaff}
                                        onChange={value => setTargetStaff(value)}
                                        options={targetStaffOptions}
                                        showSearch={{
                                            optionFilterProp: 'value',
                                            filterSort: (optionA, optionB) =>
                                                (optionA?.value ?? '').toLowerCase().localeCompare((optionB?.value ?? '').toLowerCase()),
                                        }}
                                        classNames={{popup: {listItem: 'text-center'}}}
                                    />}
                            </div>

                            <div className={`flex flex-col min-h-[170px] justify-center border-r px-4 py-3 text-sm font-medium ${labelCellClassName}`}>
                                <div>申请理由</div>
                                <div>（必填）</div>
                            </div>
                            <div className={`flex items-center px-4 py-5 ${valueCellClassName}`}>
                                <TextArea
                                    rows={5}
                                    placeholder="请简要填写申请理由..."
                                    value={reason}
                                    onChange={e => setReason(e.target.value)}
                                    maxLength={800}
                                    showCount
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div>
                {shiftScheduleTableProps && (
                    <LeaveApplyShiftScheduleTable {...shiftScheduleTableProps}/>
                )}

                {askOffOrChangeScheduleTableProps && (
                    <LeaveApplyAskOffOrChangeScheduleTable {...askOffOrChangeScheduleTableProps}/>
                )}

                {canShowActions && (
                    <div className={`flex justify-end gap-3 mt-6 pt-4 border-t-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <Button
                            icon={<SaveOutlined/>}
                            onClick={() => handleCreateLeaveApply('DRAFT')}
                        >
                            暂时保存
                        </Button>
                        <Button
                            type='primary'
                            icon={<SendOutlined/>}
                            onClick={() => handleCreateLeaveApply('PENDING_REVIEW')}
                        >
                            提交申请
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}