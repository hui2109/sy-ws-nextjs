'use client';

import {Col, DatePicker, Input, Row, Select} from "antd";
import {useEffect, useState} from "react";
import dayjs, {Dayjs} from "dayjs";
import {getValidStaff} from "@/api/Person/getValidStaff";
import getValidBanNames from "@/api/BanType/getValidBanNames";
import {sortBanTypeList} from "@/components/utils/sortBanTypeList";
import {useAppContext} from "@/components/hooks/AppProvider";
import {getWSbyNameDates} from "@/api/WorkSchedule/getWSbyNameDates";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import LeaveApplyShiftScheduleTable from "@/components/tables/LeaveApplyList/LeaveApplyTables/LeaveApplyShiftScheduleTable";
import LeaveApplyAskOffTable from "@/components/tables/LeaveApplyList/LeaveApplyTables/LeaveApplyAskOffTable";
import LeaveApplyChangeScheduleTable from "@/components/tables/LeaveApplyList/LeaveApplyTables/LeaveApplyChangeScheduleTable";

const {TextArea} = Input;
const {RangePicker} = DatePicker;

type LeaveApplyType = '换班' | '请假' | '改班';

export default function LeaveApplyForm() {
    const {currentUser} = useAppContext();
    const [leaveApplyType, setLeaveApplyType] = useState<null | LeaveApplyType>(null);
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
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        if (!dateRange || !dateRange[0] || !dateRange[1]) return;

        const names = currentUser === targetStaff ? [currentUser] : [currentUser, targetStaff];
        for (const name of names) {
            if (!name) continue;

            getWSbyNameDates(name, dateRange[0].format('YYYY-MM-DD'), dateRange[1].format('YYYY-MM-DD'))
                .then(dateBansMap => {
                    if (isMounted) {
                        setPersonDateBansMap(prev => ({
                            ...prev,
                            [name]: dateBansMap
                        }));
                    }
                });
        }

        return () => {
            isMounted = false;
        }
    }, [currentUser, targetStaff, dateRange]);

    return (
        <div>
            <div>
                <Row>
                    <Col span={12}>申请类别</Col>
                    <Col span={12}>
                        <Select
                            placeholder="选择类别..."
                            value={leaveApplyType}
                            onChange={value => setLeaveApplyType(value)}
                            options={Array<LeaveApplyType>('换班', '请假', '改班').map((item) => ({
                                label: item,
                                value: item,
                            }))}
                            style={{width: 150}}
                            classNames={{popup: {listItem: 'text-center'}}}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>日期范围</Col>
                    <Col span={12}>
                        <RangePicker
                            value={dateRange}
                            onChange={dates => setDateRange(dates)}
                        />
                    </Col>
                </Row>
                {(leaveApplyType && leaveApplyType !== '请假') &&
                    <Row>
                        <Col span={12}>{leaveApplyType === '换班' ? '和谁换班' : '改谁的班'}</Col>
                        <Col span={12}>
                            <Select
                                loading={!validStaffs}
                                placeholder="选择人员..."
                                value={targetStaff}
                                onChange={value => setTargetStaff(value)}
                                options={validStaffs?.map(validBanName => ({
                                    label: validBanName,
                                    value: validBanName,
                                }))}
                                style={{width: 150}}
                                classNames={{popup: {listItem: 'text-center'}}}
                            />
                        </Col>
                    </Row>
                }
                <Row>
                    <Col span={12}>理由</Col>
                    <Col span={12}>
                        <TextArea
                            rows={2}
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                        />
                    </Col>
                </Row>
            </div>
            {leaveApplyType === '换班' && currentUser && targetStaff && personDateBansMap && banTypeColorMap && dateRange?.[0] && dateRange?.[1] && (
                <LeaveApplyShiftScheduleTable
                    personDateBansMap={personDateBansMap}
                    banTypeColorMap={banTypeColorMap}
                    dateRange={[dateRange[0], dateRange[1]]}
                    names={[currentUser, targetStaff]}
                />
            )}
            {leaveApplyType === '请假' && currentUser && personDateBansMap && banTypeColorMap && dateRange?.[0] && dateRange?.[1] && validBanNames && (
                <LeaveApplyAskOffTable
                    personDateBansMap={personDateBansMap}
                    banTypeColorMap={banTypeColorMap}
                    dateRange={[dateRange[0], dateRange[1]]}
                    currentUser={currentUser}
                    validBanNames={validBanNames}
                />
            )}
            {leaveApplyType === '改班' && targetStaff && personDateBansMap && banTypeColorMap && dateRange?.[0] && dateRange?.[1] && validBanNames && (
                <LeaveApplyChangeScheduleTable
                    personDateBansMap={personDateBansMap}
                    banTypeColorMap={banTypeColorMap}
                    dateRange={[dateRange[0], dateRange[1]]}
                    targetStaff={targetStaff}
                    validBanNames={validBanNames}
                />
            )}
        </div>
    )
}