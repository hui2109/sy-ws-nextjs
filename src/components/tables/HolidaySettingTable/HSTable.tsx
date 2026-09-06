import {Button, Checkbox, Table, TableColumnsType} from "antd";
import type {Dispatch, SetStateAction} from "react";
import {useState} from "react";
import useHSTableData, {IRuleData} from "@/components/tables/HolidaySettingTable/useHSTableData";
import {components} from "@/components/tables/HolidaySettingTable/EditableComponents";
import saveRule from "@/api/VacationRule/saveRule";
import {useAppContext} from "@/components/hooks/AppProvider";

interface IHSTableTools {
    ruleData: IRuleData[];
    showHiddenRules: boolean;
    setShowHiddenRules: Dispatch<SetStateAction<boolean>>;
    isEditable: boolean;
    loading: boolean;
}

export default function HSTable({isEditable = true}: { isEditable?: boolean }) {
    const [showHiddenRules, setShowHiddenRules] = useState(false);

    const {ruleData, tableData, renderedColumns, loading, ready, onChange} =
        useHSTableData(showHiddenRules, isEditable);

    /*
     * 第一次加载时没有可显示数据。
     * 后续切换 showHiddenRules 时 hook 会暂时保留上一份 snapshot，
     * 所以 Table 不会卸载，而是通过 loading 显示加载状态。
     */
    if (!ready || !ruleData || renderedColumns.length === 0) return null;

    return (
        <Table<IRuleData>
            components={components}
            loading={loading}
            columns={renderedColumns as TableColumnsType<IRuleData>}
            dataSource={tableData}
            scroll={{x: "max-content", y: 750}}
            pagination={false}
            title={() => (
                <div className="flex flex-col justify-center">
                    <div className="text-center text-2xl text-blue-600 font-bold mb-1">
                        假期{isEditable ? "设置" : "统计"}表
                    </div>
                    <HSTableTools
                        ruleData={ruleData}
                        showHiddenRules={showHiddenRules}
                        setShowHiddenRules={setShowHiddenRules}
                        isEditable={isEditable}
                        loading={loading}
                    />
                </div>
            )}
            footer={() => ""}
            column={{align: "center"}}
            size="large"
            bordered
            classNames={{footer: "!p-2", title: "!p-3"}}
            onChange={onChange}
        />
    );
}

function HSTableTools({ruleData, showHiddenRules, setShowHiddenRules, isEditable, loading}: IHSTableTools) {
    const {notification} = useAppContext();

    function handleSave(rules: IRuleData[]) {
        rules.filter(rule => rule.hasModified).forEach(rule => {
            saveRule(rule).then(result => {
                switch (result) {
                    case "ok":
                        notification.success({
                            title: "假期规则已保存",
                            description: `${rule.name} 的 ${rule.banName} 规则 (${rule.startDate} 至 ${rule.endDate} ${rule.available_days} 天 ${rule.enabled ? "已启用" : "未启用"}) 已保存!`,
                        });
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
        <div className="flex justify-end items-center gap-4">
            <Checkbox checked={showHiddenRules} onChange={event => setShowHiddenRules(event.target.checked)}>
                显示未启用规则
            </Checkbox>

            {isEditable && (
                <Button
                    color="green"
                    variant="solid"
                    disabled={loading}
                    onClick={() => handleSave(ruleData)}
                >
                    保存
                </Button>
            )}
        </div>
    );
}
