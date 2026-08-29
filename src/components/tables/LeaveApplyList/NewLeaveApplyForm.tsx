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
import LeaveApplyShiftScheduleTable from "@/components/tables/LeaveApplyList/LeaveApplyTables/LeaveApplyShiftScheduleTable";
import LeaveApplyAskOffOrChangeScheduleTable from "@/components/tables/LeaveApplyList/LeaveApplyTables/LeaveApplyAskOffOrChangeScheduleTable";
import {leaveApplyStatusColorMap} from "@/components/tables/LeaveApplyList/LeaveApplyList";
import {SaveOutlined, SendOutlined} from "@ant-design/icons";

const {TextArea} = Input;
const {RangePicker} = DatePicker;

export type TLeaveApplyType = '换班' | '请假' | '改班';

export interface ILeaveApplyAssignmentsJson {
    leaveApplyType: TLeaveApplyType;
    dateNameAssignments: Record<`${number}-${number}-${number}`, Record<string, (number | string)[]>>;
}

const leaveApplyTypeOptions: TLeaveApplyType[] = ['换班', '请假', '改班'];

export default function NewLeaveApplyForm() {
    const {currentUser, resolvedTheme} = useAppContext();
    const isDark = resolvedTheme === 'dark';
    const [leaveApplyType, setLeaveApplyType] = useState<null | TLeaveApplyType>(null);
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>([dayjs(), dayjs().add(4, 'day')]);
    const [targetStaff, setTargetStaff] = useState<string | null>(null);
    const [reason, setReason] = useState<string>('');
    const [personDateBansMap, setPersonDateBansMap] = useState<Record<string, Record<string, [string, number][]>> | null>(null);
    const [validStaffs, setValidStaffs] = useState<string[] | null>(null);
    const [validBanNames, setValidBanNames] = useState<string[] | null>(null);
    const [banTypeColorMap, setBanTypeColorMap] = useState<Record<string, string> | null>(null);

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
                const newData = {...prev};

                for (const [name, dateBansMap] of results) {
                    // 这个每次都更新
                    newData[name] = dateBansMap;
                    const tempKey = `${name}_`;
                    // 只有原来的 state 里没有 name_，才初始化它
                    if (!Object.prototype.hasOwnProperty.call(prev, tempKey)) {
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


    function handleSubmit() {
        if (!personDateBansMap || !leaveApplyType) return null;

        const leaveApplyAssignmentsJson: ILeaveApplyAssignmentsJson = {
            leaveApplyType: leaveApplyType,
            dateNameAssignments: convertPersonDateBansMapToDateNameAssignments(personDateBansMap),
        };


        console.log(leaveApplyAssignmentsJson);
    }

    console.log(personDateBansMap)

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
                                    color={leaveApplyStatusColorMap['草稿']}
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
                                    onChange={value => {
                                        if (value === '换班' && targetStaff === currentUser) {
                                            setTargetStaff(null);
                                        }
                                        setLeaveApplyType(value);
                                    }}
                                    options={leaveApplyTypeOptions.map(item => ({
                                        label: item,
                                        value: item,
                                    }))}
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

                            {leaveApplyType && leaveApplyType !== '请假' && (
                                <>
                                    <div className={`flex min-h-[60px] items-center border-b border-r px-4 py-3 text-sm font-medium ${labelCellClassName}`}>
                                        {leaveApplyType === '换班' ? '换班对象' : '调整人员'}
                                    </div>
                                    <div className={`flex items-center border-b px-4 py-2.5 ${valueCellClassName}`}>
                                        <Select
                                            className="w-full max-w-[180px] text-center"
                                            loading={!validStaffs}
                                            placeholder="请选择人员"
                                            value={targetStaff}
                                            onChange={value => setTargetStaff(value)}
                                            options={validStaffs?.filter(staff => leaveApplyType !== '换班' || staff !== currentUser)
                                                .map(staff => ({
                                                    label: staff,
                                                    value: staff,
                                                }))}
                                            showSearch={{
                                                optionFilterProp: 'value',
                                                filterSort: (optionA, optionB) =>
                                                    (optionA?.value ?? '').toLowerCase().localeCompare((optionB?.value ?? '').toLowerCase()),
                                            }}
                                            classNames={{popup: {listItem: 'text-center'}}}
                                        />
                                    </div>
                                </>
                            )}

                            <div className={`flex flex-col min-h-[170px] justify-center border-r px-4 py-3 text-sm font-medium ${labelCellClassName}`}>
                                <div>申请理由</div>
                                <div>（必填）</div>
                            </div>
                            <div className={`flex items-center px-4 py-5 ${valueCellClassName}`}>
                                <TextArea
                                    className="!resize-none"
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
                {leaveApplyType === '换班' && currentUser && targetStaff && personDateBansMap && banTypeColorMap && dateRange?.[0] && dateRange?.[1] && (
                    <LeaveApplyShiftScheduleTable
                        personDateBansMap={personDateBansMap}
                        banTypeColorMap={banTypeColorMap}
                        dateRange={[dateRange[0], dateRange[1]]}
                        names={[currentUser, targetStaff]}
                    />
                )}

                {leaveApplyType && leaveApplyType !== '换班' && currentUser && personDateBansMap && banTypeColorMap && dateRange?.[0] && dateRange?.[1] && validBanNames && (
                    <LeaveApplyAskOffOrChangeScheduleTable
                        leaveApplyType={leaveApplyType}
                        personDateBansMap={personDateBansMap}
                        setPersonDateBansMap={setPersonDateBansMap}
                        banTypeColorMap={banTypeColorMap}
                        dateRange={[dateRange[0], dateRange[1]]}
                        currentUser={currentUser}
                        targetStaff={targetStaff}
                        validBanNames={validBanNames}
                    />
                )}

                {leaveApplyType && dateRange?.[0] && dateRange?.[1] && currentUser && reason.trim() !== '' && (leaveApplyType !== '请假' ? targetStaff : true) && (
                    <div className={`flex justify-end gap-3 mt-6 pt-4 border-t-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <Button
                            icon={<SaveOutlined/>}
                            // onClick={handleSaveDraft}
                            // loading={saving}
                        >
                            暂时保存
                        </Button>
                        <Button
                            type='primary'
                            icon={<SendOutlined/>}
                            onClick={handleSubmit}
                            // loading={submitting}
                        >
                            提交申请
                        </Button>
                    </div>
                )
                }
            </div>
        </div>
    );
}

function convertPersonDateBansMapToDateNameAssignments(personDateBansMap: Record<string, Record<string, [string, number][]>>): ILeaveApplyAssignmentsJson['dateNameAssignments'] {
    return Object.entries(personDateBansMap).reduce(
        (prev, [personName, dateMap]) => {
            Object.entries(dateMap).forEach(([date, bans]) => {
                prev[date] = prev[date] || {};
                prev[date][personName] = bans.map(([banName, id]) => {
                    if (personName.indexOf('_') === -1) return id; else return banName;
                });
            });
            return prev;
        },
        {} as Record<string, Record<string, (number | string)[]>>
    )
}