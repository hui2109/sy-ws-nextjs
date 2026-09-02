'use client';

import {Badge, Card, Tag} from "antd";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {LeaveApplyStatus, LeaveApplyType} from "@/prisma/generated/enums";
import {IPersonDateBansMap} from "@/components/tables/LeaveApplyTab/LeaveApplyFormNew";
import getLeaveAppliesbyNameStatus from "@/api/LeaveApply/getLeaveAppliesbyNameStatus";
import {useAppContext} from "@/components/hooks/AppProvider";
import {leaveApplyStatusColorMap, leaveApplyStatusMap, leaveApplyTypeColorMap, leaveApplyTypeMap} from "@/configs/general";
import dayjs, {Dayjs} from "dayjs";
import LeaveApplyModal from "@/components/tables/LeaveApplyTab/LeaveApplyModal";
import {LeaveApplyTabStatus} from "@/components/tables/LeaveApplyTab/LeaveApplyTab";

export interface ILeaveApplyRecord {
    id: number;
    leaveApplyType: LeaveApplyType;
    applyUser: string;
    targetStaff: string;
    start_date: string;
    end_date: string;
    created_date: string;
    status: LeaveApplyStatus;
    reason: string;
    assignmentsJson: IPersonDateBansMap;
}

interface ILeaveApplyCard {
    leaveApplyRecord: ILeaveApplyRecord;
    loading: boolean;
    isDark: boolean;
    setIsLeaveApplyModalOpen: Dispatch<SetStateAction<boolean>>
    setClickedLeaveApplyDetails: Dispatch<SetStateAction<IClickedLeaveApplyDetails | null>>;
}

export interface IClickedLeaveApplyDetails {
    id: number;
    status: LeaveApplyStatus;
    leaveApplyType: LeaveApplyType;
    dateRange: [Dayjs, Dayjs];
    applyUser: string;
    targetStaff: string;
    reason: string;
    assignmentsJson: IPersonDateBansMap;
    createdDate: Dayjs;

}

export default function LeaveApplyList({name, leaveApplyTabStatus}: { name: string, leaveApplyTabStatus: LeaveApplyTabStatus }) {
    const {resolvedTheme} = useAppContext();
    const isDark = resolvedTheme === "dark";
    const [loading, setLoading] = useState<boolean>(true);
    const [leaveApplyRecords, setLeaveApplyRecords] = useState<ILeaveApplyRecord[] | null>(null);
    const [isLeaveApplyModalOpen, setIsLeaveApplyModalOpen] = useState<boolean>(false);
    const [clickedLeaveApplyDetails, setClickedLeaveApplyDetails] = useState<IClickedLeaveApplyDetails | null>(null);

    useEffect(() => {
        let isMounted = true;

        if (isMounted) {
            getLeaveAppliesbyNameStatus(name, leaveApplyTabStatus).then(leaveApplyRecords => {
                setLeaveApplyRecords(leaveApplyRecords);
                setLoading(false);
            })
        }

        return () => {
            isMounted = false;
            setLoading(true);
        };
    }, [name, leaveApplyTabStatus]);

    return (
        <div className={`rounded-2xl p-6 pt-3 transition-colors duration-200 ${
            isDark
                ? 'bg-slate-950 text-slate-100'
                : 'bg-slate-50 text-slate-900'}`}
        >
            <div className="mb-2 flex justify-end items-center gap-2">
                {!loading && leaveApplyRecords && (
                    <div
                        className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${
                            isDark
                                ? 'border-slate-700 bg-slate-900 text-slate-300'
                                : 'border-slate-200 bg-white text-slate-600'}`}
                    >
                        共 {leaveApplyRecords.length} 条记录
                    </div>
                )}
            </div>

            {loading ? (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
                    {Array.from({length: 6}).map((_, index) => (
                        <Card
                            key={index}
                            loading
                            className={`h-[292px] !rounded-2xl !border shadow-sm ${
                                isDark
                                    ? '!border-slate-800 !bg-slate-900'
                                    : '!border-slate-200 !bg-white'}`}
                        />
                    ))}
                </div>
            ) : leaveApplyRecords?.length ? (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
                    {leaveApplyRecords.map(leaveApplyRecord => (
                        <LeaveApplyCard
                            key={`${dayjs(leaveApplyRecord.created_date).toISOString()}_${leaveApplyRecord.reason}`}
                            leaveApplyRecord={leaveApplyRecord}
                            loading={loading}
                            isDark={isDark}
                            setIsLeaveApplyModalOpen={setIsLeaveApplyModalOpen}
                            setClickedLeaveApplyDetails={setClickedLeaveApplyDetails}
                        />
                    ))}
                </div>
            ) : (
                <div
                    className={`flex min-h-56 justify-center items-center rounded-2xl border border-dashed px-6 text-center ${
                        isDark
                            ? 'border-slate-700 bg-slate-900/60 text-slate-400'
                            : 'border-slate-300 bg-white text-slate-500'}`}
                >
                    <p className="text-sm font-medium">暂无已保存的假勤申请记录</p>
                </div>
            )}

            {clickedLeaveApplyDetails && (
                <LeaveApplyModal
                    isModalOpen={isLeaveApplyModalOpen}
                    onClose={() => setIsLeaveApplyModalOpen(false)}
                    clickedLeaveApplyDetails={clickedLeaveApplyDetails}
                    leaveApplyTabStatus={leaveApplyTabStatus}
                />
            )}
        </div>
    )
}

function LeaveApplyCard({leaveApplyRecord, loading, isDark, setIsLeaveApplyModalOpen, setClickedLeaveApplyDetails}: ILeaveApplyCard) {
    const {id, leaveApplyType, applyUser, targetStaff, start_date, end_date, created_date, status, reason, assignmentsJson} = leaveApplyRecord;
    const startDate = dayjs(start_date);
    const endDate = dayjs(end_date);
    const createdDate = dayjs(created_date);

    return (
        <Card
            loading={loading}
            classNames={{
                body: "!p-0",
                root: `cursor-pointer !rounded-2xl !border shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 ${
                    isDark
                        ? '!border-slate-800 !bg-slate-900 hover:!border-slate-700'
                        : '!border-slate-200 !bg-white hover:!border-slate-300'}`
            }}
            onClick={() => {
                setIsLeaveApplyModalOpen(true);
                setClickedLeaveApplyDetails({
                    id,
                    status,
                    leaveApplyType,
                    dateRange: [startDate, endDate],
                    applyUser: applyUser,
                    targetStaff,
                    reason,
                    assignmentsJson,
                    createdDate
                });
            }}
        >
            <div className="flex flex-col">
                <div className="flex justify-between items-center px-5 pb-4 pt-5">
                    <div>
                        <div className={`mb-1 text-base font-semibold ${
                            isDark
                                ? 'text-slate-100'
                                : 'text-slate-900'}`}
                        >
                            {leaveApplyType === 'CHANGE_SCHEDULE' ? targetStaff : applyUser}
                        </div>
                        <div className={`text-sm font-medium ${
                            isDark
                                ? 'text-slate-400'
                                : 'text-slate-500'}`}
                        >
                            <Badge
                                count={`${leaveApplyTypeMap[leaveApplyType]}申请`}
                                color={leaveApplyTypeColorMap[leaveApplyType]}
                                classNames={{indicator: '!rounded-lg !font-bold'}}
                            />
                        </div>
                    </div>
                    <Tag
                        color={leaveApplyStatusColorMap[status]}
                        variant="solid"
                        className="!shrink-0 !rounded-full !px-2.5 !py-0.5 !text-xs !font-semibold"
                    >
                        {leaveApplyStatusMap[status]}
                    </Tag>
                </div>
                <div className="px-5">
                    <div className={`rounded-xl border px-4 py-3 ${
                        isDark
                            ? 'border-slate-800 bg-slate-950/70'
                            : 'border-slate-100 bg-slate-50'}`}
                    >
                        <div className={`mb-2 text-[11px] font-semibold tracking-[0.12em] ${
                            isDark
                                ? 'text-slate-500'
                                : 'text-slate-400'}`}
                        >
                            申请日期
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                <div className={`text-xs ${
                                    isDark
                                        ? 'text-slate-500'
                                        : 'text-slate-400'}`}
                                >
                                    开始日期
                                </div>
                                <div className={`mt-0.5 text-sm font-semibold ${
                                    isDark
                                        ? 'text-slate-100'
                                        : 'text-slate-800'}`}
                                >
                                    {startDate.format("YYYY/M/D")}
                                </div>
                            </div>
                            <div className={`shrink-0 text-base font-medium ${
                                isDark
                                    ? 'text-slate-500'
                                    : 'text-slate-400'}`}
                            >
                                →
                            </div>
                            <div className="flex-1 text-right">
                                <div className={`text-xs ${
                                    isDark
                                        ? 'text-slate-500'
                                        : 'text-slate-400'}`}
                                >
                                    结束日期
                                </div>
                                <div className={`mt-0.5 text-sm font-semibold ${
                                    isDark
                                        ? 'text-slate-100'
                                        : 'text-slate-800'}`}
                                >
                                    {endDate.format("YYYY/M/D")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-5 py-4">
                    <div className={`mb-1 text-xs font-medium ${
                        isDark
                            ? 'text-slate-500'
                            : 'text-slate-400'}`}
                    >
                        申请事由
                    </div>
                    <p className={`line-clamp-2 min-h-10 text-sm leading-5 ${
                        isDark
                            ? 'text-slate-300'
                            : 'text-slate-600'}`}
                    >
                        {reason || "未填写申请事由"}
                    </p>
                </div>
                <div className={`flex justify-between items-center border-t px-5 py-3.5 ${
                    isDark
                        ? 'border-slate-800'
                        : 'border-slate-100'}`}
                >
                    <div>
                        <div
                            className={`text-[11px] ${
                                isDark
                                    ? 'text-slate-500'
                                    : 'text-slate-400'}`}
                        >
                            发起人
                        </div>
                        <div className={`mt-0.5 text-xs font-medium ${
                            isDark
                                ? 'text-slate-300'
                                : 'text-slate-600'}`}
                        >
                            {applyUser}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className={`text-[11px] ${
                            isDark
                                ? 'text-slate-500'
                                : 'text-slate-400'}`}
                        >
                            发起时间
                        </div>
                        <div className={`mt-0.5 text-xs font-medium tabular-nums ${
                            isDark
                                ? 'text-slate-300'
                                : 'text-slate-600'}`}
                        >
                            {createdDate.format("YYYY/M/D HH:mm")}
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
}
