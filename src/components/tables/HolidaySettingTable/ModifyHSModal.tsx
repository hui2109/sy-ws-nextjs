'use client';

import {EditOutlined} from '@ant-design/icons';
import {InputNumber, Modal, Select, Tag} from 'antd';
import React, {useState} from 'react';
import {IRuleData} from '@/components/tables/HolidaySettingTable/useHSTableData';
import {useAppContext} from '@/components/hooks/AppProvider';
import updateRules from "@/api/VacationRule/updateRules";
import {useHSTableContext} from "@/components/hooks/HSTableContext";

type IModifyFieldType = '是否启用' | '总天数';
type IIsEnabled = '启用' | '不启用';

interface IModifyHSModal {
    isModalOpen: boolean;
    onClose: () => void;
    tableData: IRuleData[];
}

export default function ModifyHSModal({isModalOpen, onClose, tableData}: IModifyHSModal) {
    const {resolvedTheme, notification} = useAppContext();
    const {refresh} = useHSTableContext();
    const [fieldType, setFieldType] = useState<IModifyFieldType | null>(null);
    const [isEnabled, setIsEnabled] = useState<IIsEnabled | null>(null);
    const [changeNum, setChangeNum] = useState(0);

    const isDark = resolvedTheme === 'dark';
    const labelClass = `flex items-center px-4 text-sm font-medium ${isDark ? 'bg-white/[0.04] text-gray-300' : 'bg-gray-50 text-gray-600'}`;
    const valueClass = `flex items-center px-4 min-h-[64px] ${isDark ? 'bg-[#181818]' : 'bg-white'}`;
    const borderClass = isDark ? 'border-white/10' : 'border-gray-200';

    function handleOk() {
        const ruleIds = tableData.map(item => item.id);
        if (!ruleIds.length || !fieldType) return;

        if (fieldType === '是否启用') {
            if (isEnabled === null) return;

            updateRules(ruleIds, isEnabled === '启用').then(res => {
                if (res) {
                    notification.success({
                        title: '假期规则批量修改成功',
                        description: `成功将 ${tableData.length} 条假期规则的 ${fieldType} 字段改为 ${isEnabled}!`
                    });
                    refresh();
                }
            })
        }

        if (fieldType === '总天数') {
            if (changeNum === 0) return;

            updateRules(ruleIds, undefined, changeNum).then(res => {
                if (res) {
                    notification.success({
                        title: '假期规则批量修改成功',
                        description: `成功将 ${tableData.length} 条假期规则的 ${fieldType} 字段 ${changeNum >= 0 ? '增加' : '减少'} ${changeNum} 天!`
                    });
                    refresh();
                }
            })
        }
    }

    return (
        <Modal
            open={isModalOpen}
            onOk={() => {
                handleOk();
                onClose();
            }}
            onCancel={onClose}
            width={540}
            okText="确认修改"
            cancelText="取消"
            title={
                <div className="flex items-center gap-3 py-1">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${isDark
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'bg-blue-50 text-blue-600'}
                        `}>
                        <EditOutlined/>
                    </div>
                    <div>
                        <div className={`text-base font-semibold ${
                            isDark ? 'text-gray-100' : 'text-gray-800'
                        }`}>
                            批量修改假期规则
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 text-xs font-normal ${
                            isDark ? 'text-gray-500' : 'text-gray-400'
                        }`}>
                            <div>当前已选择</div>
                            <Tag color='magenta' variant='solid'>{tableData.length}</Tag>
                            <div>条规则</div>
                        </div>
                    </div>
                </div>
            }
        >
            <div className={`mt-3 grid grid-cols-[120px_minmax(0,1fr)] overflow-hidden rounded-xl border ${borderClass}`}>
                <div className={labelClass}>修改字段</div>
                <div className={valueClass}>
                    <Select<IModifyFieldType>
                        value={fieldType}
                        onChange={setFieldType}
                        placeholder="请选择修改字段"
                        options={['是否启用', '总天数'].map(value => ({
                            label: value,
                            value,
                        }))}
                        className="w-full text-center max-w-60"
                        classNames={{popup: {listItem: 'text-center'}}}
                    />
                </div>

                <div className={`${labelClass} border-t ${borderClass}`}>
                    字段值
                </div>
                <div className={`${valueClass} border-t ${borderClass}`}>
                    {fieldType === '是否启用' && (
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
                    )}

                    {fieldType === '总天数' && (
                        <div className="flex items-center gap-3">
                            <span className={`text-sm ${
                                changeNum >= 0
                                    ? 'text-emerald-500'
                                    : 'text-red-500'
                            }`}>
                                {changeNum >= 0 ? '增加' : '减少'}
                            </span>
                            <InputNumber
                                value={changeNum}
                                onChange={value => setChangeNum(value ?? 0)}
                                mode="spinner"
                                min={-20}
                                max={20}
                                className={'max-w-50'}
                            />
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                天
                            </span>
                        </div>
                    )}

                    {!fieldType && (
                        <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            请先选择要修改的字段
                        </span>
                    )}
                </div>
            </div>
        </Modal>
    );
}
