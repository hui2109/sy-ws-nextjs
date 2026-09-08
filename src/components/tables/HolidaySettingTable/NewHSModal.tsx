'use client';

import {PlusOutlined} from '@ant-design/icons';
import {Badge, Checkbox, DatePicker, Input, InputNumber, Modal, Select, Tag} from 'antd';
import React, {useEffect, useState} from 'react';
import {useAppContext} from '@/components/hooks/AppProvider';
import {getValidStaff} from "@/api/Person/getValidStaff";
import getValidBanNames from "@/api/BanType/getValidBanNames";
import {filteredRelaxBanNames} from "@/components/utils/filteredRelaxBanNames";
import {getBanTypeColorMap} from "@/api/BanType/getBanTypeColorMap";
import dayjs, {Dayjs} from "dayjs";
import createRules from "@/api/VacationRule/createRules";
import {useHSTableContext} from "@/components/hooks/HSTableContext";

const {RangePicker} = DatePicker;

type IIsEnabled = '启用' | '不启用';

interface INewHSModal {
    isModalOpen: boolean;
    onClose: () => void;
}

export default function NewHSModal({isModalOpen, onClose}: INewHSModal) {
    const {resolvedTheme, notification} = useAppContext();
    const {refresh} = useHSTableContext();
    const [validStaffs, setValidStaffs] = useState<string[] | null>(null);
    const [validBanNames, setValidBanNames] = useState<string[] | null>(null);
    const [banTypeColorMap, setBanTypeColorMap] = useState<Record<string, string> | null>(null);
    const [selectedStaffs, setSelectedStaffs] = useState<string[] | null>(null);
    const [selectedBanName, setSelectedBanName] = useState<string | null>(null);
    const [totalNum, setTotalNum] = useState(0);
    const [isEnabled, setIsEnabled] = useState<IIsEnabled | null>(null);
    const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(() => {
        const now = dayjs().add(1, 'year');
        return [now.startOf('year'), now.endOf('year')];
    });

    const isDark = resolvedTheme === 'dark';
    const labelClass = `flex items-center px-4 text-sm font-medium ${isDark ? 'bg-white/[0.04] text-gray-300' : 'bg-gray-50 text-gray-600'}`;
    const valueClass = `flex items-center px-4 min-h-[64px] ${isDark ? 'bg-[#181818]' : 'bg-white'}`;
    const borderClass = isDark ? 'border-white/10' : 'border-gray-200';

    useEffect(() => {
        let isMounted = true;

        Promise.all([
            getValidStaff(),
            getValidBanNames(),
            getBanTypeColorMap()
        ]).then(([validStaffs, validBanNames, banTypeColorMap]) => {
            if (isMounted) {
                setValidStaffs(validStaffs);
                setValidBanNames(filteredRelaxBanNames(validBanNames));
                setBanTypeColorMap(banTypeColorMap);
            }
        });

        return () => {
            isMounted = false;
        }
    }, []);

    function handleOk() {
        if (
            !selectedStaffs?.length ||
            !selectedBanName ||
            !dateRange?.[0] ||
            !dateRange?.[1] ||
            totalNum === 0 ||
            isEnabled === null
        ) return;

        createRules({
            names: selectedStaffs,
            banName: selectedBanName,
            start_date: dateRange[0].format('YYYY-MM-DD'),
            end_date: dateRange[1].format('YYYY-MM-DD'),
            availableHalfDays: totalNum * 2,
            isEnabled: isEnabled === '启用'
        }).then(res => {
            if (res) {
                notification.success({
                    title: '假期规则批量新增成功',
                    description: `成功为 ${selectedStaffs.length} 名员工新增 ${selectedBanName} 假期规则!`
                });
                refresh();
            }
        })
    }

    if (!validStaffs || !validBanNames || !banTypeColorMap) return null;

    return (
        <Modal
            open={isModalOpen}
            onOk={() => {
                handleOk();
                onClose();
            }}
            onCancel={onClose}
            width={540}
            okText="确认新增"
            cancelText="取消"
            title={
                <div className="flex items-center gap-3 py-1">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isDark
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                        <PlusOutlined/>
                    </div>
                    <div>
                        <div className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                            批量新增假期规则
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 text-xs font-normal ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            <div>当前已选择</div>
                            <Tag color="magenta" variant="solid">{selectedStaffs?.length ?? 0}</Tag>
                            <div>名员工</div>
                        </div>
                    </div>
                </div>
            }
        >
            <div className={`mt-3 grid grid-cols-[120px_minmax(0,1fr)] overflow-hidden rounded-xl border ${borderClass}`}>
                <div className={labelClass}>选择人员</div>
                <div className={valueClass}>
                    <Select
                        value={selectedStaffs}
                        onChange={setSelectedStaffs}
                        placeholder="请选择员工"
                        options={validStaffs.map(name => ({
                            label: name,
                            value: name,
                        }))}
                        showSearch={{
                            optionFilterProp: 'value',
                            filterSort: (optionA, optionB) =>
                                (optionA?.value ?? '').toLowerCase().localeCompare((optionB?.value ?? '').toLowerCase()),
                        }}
                        mode="multiple"
                        popupRender={menu => (
                            <>
                                <div
                                    className={`flex items-center justify-center px-3 py-2 border-b ${borderClass}`}
                                    onMouseDown={e => e.preventDefault()}
                                >
                                    <Checkbox
                                        checked={selectedStaffs?.length === validStaffs.length}
                                        indeterminate={!!selectedStaffs?.length && selectedStaffs.length < validStaffs.length}
                                        onChange={e => setSelectedStaffs(e.target.checked ? validStaffs : [])}
                                    >
                                        全选
                                    </Checkbox>
                                </div>
                                {menu}
                            </>
                        )}
                        maxTagCount='responsive'
                        className="w-full max-w-[300px]"
                        classNames={{popup: {listItem: 'text-center'}}}
                    />

                </div>

                <div className={`${labelClass} border-t ${borderClass}`}>假期类型</div>
                <div className={`${valueClass} border-t ${borderClass}`}>
                    <Select
                        value={selectedBanName}
                        onChange={setSelectedBanName}
                        placeholder="请选择假期类型"
                        options={validBanNames.map(banName => ({
                            label: (
                                <Badge
                                    count={banName}
                                    color={banTypeColorMap[banName]}
                                    classNames={{indicator: '!rounded-lg !font-bold'}}
                                />
                            ),
                            value: banName,
                        }))}
                        className="w-full text-center max-w-60"
                        classNames={{popup: {listItem: 'text-center'}}}
                    />
                </div>

                <div className={`${labelClass} border-t ${borderClass}`}>起止日期</div>
                <div className={`${valueClass} border-t ${borderClass}`}>
                    <RangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        className="w-full max-w-[350px]"
                    />
                </div>

                <div className={`${labelClass} border-t ${borderClass}`}>总天数</div>
                <div className={`${valueClass} border-t ${borderClass}`}>
                    {selectedBanName === '年假'
                        ?
                        <Input
                            className={'text-center'}
                            value={'自动计算'}
                            disabled
                        />
                        :
                        <div className="flex items-center gap-3">
                            <InputNumber
                                value={totalNum}
                                onChange={value => setTotalNum(value ?? 0)}
                                mode="spinner"
                                min={0}
                                max={50}
                                className="max-w-50"
                            />
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    天
                            </span>
                        </div>
                    }
                </div>

                <div className={`${labelClass} border-t ${borderClass}`}>是否启用</div>
                <div className={`${valueClass} border-t ${borderClass}`}>
                    <Select
                        value={isEnabled}
                        onChange={setIsEnabled}
                        placeholder="请选择状态"
                        options={['启用', '不启用'].map(value => ({
                            label: value,
                            value,
                        }))}
                        className="w-full text-center max-w-60"
                        classNames={{popup: {listItem: 'text-center'}}}
                    />
                </div>
            </div>
        </Modal>
    );
}
