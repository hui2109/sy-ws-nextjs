'use client';

import {Button, Checkbox, Table, TableColumnsType} from "antd";
import {Dispatch, SetStateAction, useState} from "react";
import useHSTableData, {IRuleData} from "@/components/tables/HolidaySettingTable/useHSTableData";
import {components} from "@/components/tables/HolidaySettingTable/EditableComponents";
import saveRule from "@/api/VacationRule/saveRule";
import {useAppContext} from "@/components/hooks/AppProvider";
import ModifyHSModal from "@/components/tables/HolidaySettingTable/ModifyHSModal";
import {useHSTableContext} from "@/components/hooks/HSTableContext";
import NewHSModal from "@/components/tables/HolidaySettingTable/NewHSModal";

interface IHSTableTools {
    tableData: IRuleData[];
    ruleData: IRuleData[];
    showHiddenRules: boolean;
    setShowHiddenRules: Dispatch<SetStateAction<boolean>>;
    isEditable: boolean;
    resetTableState: () => void;
}

export default function HSTable({isEditable = true}: { isEditable?: boolean }) {
    const {resolvedViewport} = useAppContext();
    const [showHiddenRules, setShowHiddenRules] = useState(false);
    const {ruleData, tableData, renderedColumns, onChange, loading, resetTableState} = useHSTableData(showHiddenRules, isEditable);

    if (!ruleData || renderedColumns.length === 0) return null;

    return (
        <div className='max-desktop:px-3 max-desktop:pb-3'>
            <Table
                components={components}
                loading={loading}
                column={{align: "center"}}
                columns={renderedColumns as TableColumnsType<IRuleData>}
                dataSource={tableData}
                scroll={{x: "max-content", y: 'calc(100dvh - 260px)'}}
                pagination={false}
                title={() => (
                    <div className="flex flex-col justify-center">
                        <div className="text-center text-2xl text-blue-600 font-bold mb-1 max-desktop:text-lg">
                            假期{isEditable ? "设置" : "统计"}表
                        </div>
                        <HSTableTools
                            tableData={tableData}
                            ruleData={ruleData}
                            showHiddenRules={showHiddenRules}
                            setShowHiddenRules={setShowHiddenRules}
                            isEditable={isEditable}
                            resetTableState={resetTableState}
                        />
                    </div>
                )}
                footer={() => ""}
                size={resolvedViewport === 'mobile' ? "small" : 'large'}
                bordered
                classNames={{
                    footer: '!p-2',
                    title: '!p-3 max-desktop:!p-2',
                    header: {cell: 'max-desktop:!p-1'},
                }}
                className='rounded-lg overflow-hidden'
                onChange={onChange}
            />
        </div>
    );
}

function HSTableTools({tableData, ruleData, showHiddenRules, setShowHiddenRules, isEditable, resetTableState}: IHSTableTools) {
    const {notification, resolvedViewport} = useAppContext();
    const {refresh} = useHSTableContext();
    const [isModifyHSModalOpen, setIsModifyHSModalOpen] = useState<boolean>(false);
    const [isNewHSModalOpen, setIsNewHSModalOpen] = useState<boolean>(false);

    function handleSave(rules: IRuleData[]) {
        rules.filter(rule => rule.hasModified).forEach(rule => {
            saveRule(rule).then(result => {
                switch (result) {
                    case "ok":
                        notification.success({
                            title: "假期规则已保存",
                            description: `${rule.name} 的 ${rule.banName} 规则 (${rule.startDate} 至 ${rule.endDate} ${rule.available_days} 天 ${rule.enabled ? "已启用" : "未启用"}) 已保存!`,
                        });
                        refresh();
                        break;
                    case "Unique constraint":
                        notification.error({
                            title: "假期规则保存失败",
                            description: `${rule.name} 的 ${rule.banName} 规则 (${rule.startDate} 至 ${rule.endDate}) 保存失败! 因为已存在相同规则!`,
                        });
                        break;
                    default:
                        notification.error({
                            title: "假期规则保存失败",
                            description: "系统内部出现错误，请截图联系管理员张旭辉!\n" + `${result}`,
                        });
                }
            });
        });
    }

    return (
        <div className="flex justify-end items-center gap-1">
            <Checkbox checked={showHiddenRules} onChange={event => setShowHiddenRules(event.target.checked)}>
                显示未启用规则
            </Checkbox>

            {isEditable && (
                <Button
                    size={resolvedViewport === 'mobile' ? 'small' : 'middle'}
                    color="magenta"
                    variant="solid"
                    onClick={() => {
                        handleSave(ruleData);
                        setIsNewHSModalOpen(true);
                    }}
                >
                    新增规则
                </Button>
            )}

            {isEditable && (
                <Button
                    size={resolvedViewport === 'mobile' ? 'small' : 'middle'}
                    color="gold"
                    variant="solid"
                    onClick={() => {
                        handleSave(ruleData);
                        setIsModifyHSModalOpen(true);
                    }}
                >
                    修改规则
                </Button>
            )}

            <Button
                size={resolvedViewport === 'mobile' ? 'small' : 'middle'}
                color="green"
                variant="solid"
                onClick={() => {
                    handleSave(ruleData);
                    resetTableState();
                }}
            >
                还原表格
            </Button>

            {isEditable && (
                <Button
                    size={resolvedViewport === 'mobile' ? 'small' : 'middle'}
                    color="blue"
                    variant="solid"
                    onClick={() => handleSave(ruleData)}
                >
                    保存
                </Button>
            )}

            <ModifyHSModal
                isModalOpen={isModifyHSModalOpen}
                onClose={() => setIsModifyHSModalOpen(false)}
                tableData={tableData}
            />

            <NewHSModal
                isModalOpen={isNewHSModalOpen}
                onClose={() => setIsNewHSModalOpen(false)}
            />
        </div>
    );
}
