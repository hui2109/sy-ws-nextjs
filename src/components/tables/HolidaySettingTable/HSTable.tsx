import {Button, Checkbox, Table, TableColumnsType} from "antd";
import React, {Dispatch, SetStateAction, useState} from "react";
import useHSTableData, {IRuleData} from "@/components/tables/HolidaySettingTable/useHSTableData";
import {components} from "@/components/tables/HolidaySettingTable/EditableComponents";
import saveRule from "@/api/VacationRule/saveRule";
import {useAppContext} from "@/components/hooks/AppProvider";

export default function HSTable() {
    const [showHiddenRules, setShowHiddenRules] = useState<boolean>(false);
    const {ruleData, renderedColumns, loading} = useHSTableData(showHiddenRules);

    return <Table
        components={components}
        loading={loading}
        columns={renderedColumns as TableColumnsType}
        dataSource={ruleData}
        scroll={{x: 'max-content', y: 750}}
        pagination={false}
        title={() => (
            <HSTableTools
                ruleData={ruleData}
                showHiddenRules={showHiddenRules}
                setShowHiddenRules={setShowHiddenRules}
            />
        )}
        footer={() => ''}
        column={{align: 'center'}}
        size={'large'}
        bordered
        classNames={{
            footer: '!p-2',
            title: '!p-3',
        }}
    />
}

function HSTableTools({ruleData, showHiddenRules, setShowHiddenRules}:
                      {
                          ruleData: IRuleData[],
                          showHiddenRules: boolean,
                          setShowHiddenRules: Dispatch<SetStateAction<boolean>>
                      }) {
    const {notification} = useAppContext();

    function handleSave(ruleData: IRuleData[]) {
        ruleData.filter(rule => rule.hasModified).forEach(rule => {
            saveRule(rule).then((r) => {
                switch (r) {
                    case 'ok':
                        notification.success({
                            title: '假期规则已保存',
                            description: `${rule.name} 的 ${rule.banName} 规则 (${rule.startDate} 至 ${rule.endDate} ${rule.available_days} 天 ${rule.enabled ? '已启用' : '未启用'}) 已保存!`
                        })
                        break;
                    case 'Unique constraint':
                        notification.error({
                            title: '假期规则保存失败',
                            description: `${rule.name} 的 ${rule.banName} 规则 (${rule.startDate} 至 ${rule.endDate}) 保存失败! 因为已存在相同规则!`
                        })
                        break;
                    default:
                        notification.error({
                            title: '假期规则保存失败',
                            description: `系统内部出现错误，请截图联系管理员张旭辉!\n${r}`,
                        })
                }
            })
        });
    }

    return (
        <div className='flex justify-end items-center gap-4'>
            <Checkbox
                checked={showHiddenRules}
                onChange={(e) => setShowHiddenRules(e.target.checked)}
            >
                显示未启用规则
            </Checkbox>
            <Button
                color='green'
                variant='solid'
                onClick={() => handleSave(ruleData)}
            >
                保存
            </Button>
        </div>
    )
}