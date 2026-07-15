'use client';

import React, {ReactNode, useEffect, useRef, useState} from "react";
import {DatePicker, Form, InputNumber, Select} from "antd";
import {IRuleData} from "@/components/tables/HolidaySettingTable/useHSTableData";
import dayjs from "dayjs";
import {BaseSelectRef} from "@rc-component/select";
import {PickerRef} from "@rc-component/picker";
import {InputNumberRef} from "@rc-component/input-number";

interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    dataIndex: keyof IRuleData;
    record: IRuleData;
    validStaffs: string[];
    validBanNames: string[];
    handleSave: (record: IRuleData) => void;
    children?: ReactNode | undefined
}


function EditableRow({...props}) {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <tr {...props} />
        </Form>
    );
}

function EditableCell({title, editable, dataIndex, record, validStaffs, validBanNames, handleSave, children, ...props}: EditableCellProps) {
    const [editing, setEditing] = useState<boolean>(false);
    const inputNumberRef = useRef<null | InputNumberRef>(null);
    const selectRef = useRef<null | BaseSelectRef>(null);
    const dateRef = useRef<null | PickerRef>(null);
    const form = Form.useFormInstance();
    const date_fields = ["startDate", "endDate"];

    useEffect(() => {
        if (editing) {
            inputNumberRef.current?.focus();
            selectRef.current?.focus();
            dateRef.current?.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        const rawValue = record[dataIndex];
        const fieldValue = date_fields.includes(dataIndex) && typeof rawValue === 'string'
            ? dayjs(rawValue)
            : rawValue;
        form.setFieldsValue({[dataIndex]: fieldValue});
    };

    const save = async () => {
        try {
            const values = await form.validateFields();
            toggleEdit();

            let nextValue = values[dataIndex];
            if (date_fields.includes(dataIndex) && dayjs.isDayjs(nextValue)) {
                nextValue = nextValue.format('YYYY-MM-DD');
            }

            if (record[dataIndex] !== nextValue) {
                handleSave({...record, [dataIndex]: nextValue, hasModified: true});
            }
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    let childNode = children;
    if (editable) {
        if (editing) {
            let inputNode: ReactNode;
            switch (dataIndex) {
                case 'name':
                    inputNode = (
                        <Select
                            ref={selectRef}
                            style={{width: 100}}
                            options={validStaffs.map(validStaff => ({
                                label: validStaff,
                                value: validStaff,
                            }))}
                            classNames={{popup: {listItem: 'text-center'}}}
                            onChange={save}
                            onBlur={save}
                        />
                    );
                    break;
                case 'banName':
                    inputNode = (
                        <Select
                            ref={selectRef}
                            style={{width: 100}}
                            options={validBanNames.map(validBanName => ({
                                label: validBanName,
                                value: validBanName,
                            }))}
                            classNames={{popup: {listItem: 'text-center'}}}
                            onChange={save}
                            onBlur={save}
                        />
                    );
                    break;
                case 'startDate':
                    inputNode = (
                        <DatePicker
                            ref={dateRef}
                            inputReadOnly={true}
                            allowClear={false}
                            size="small"
                            classNames={{input: 'text-center'}}
                            onChange={save}
                            onBlur={() => setTimeout(() => setEditing(false), 500)}
                        />
                    );
                    break;
                case 'endDate':
                    inputNode = (
                        <DatePicker
                            ref={dateRef}
                            inputReadOnly={true}
                            allowClear={false}
                            size="small"
                            classNames={{input: 'text-center'}}
                            onChange={save}
                            onBlur={() => setTimeout(() => setEditing(false), 500)}
                        />
                    );
                    break;
                case 'available_days':
                    inputNode = (
                        <InputNumber
                            ref={inputNumberRef}
                            mode='spinner'
                            style={{width: 100}}
                            size='small'
                            onBlur={save}
                        />
                    );
                    break;
            }

            childNode = (
                <Form.Item
                    style={{margin: 0}}
                    name={dataIndex}
                    rules={[{required: true, message: `${title} is required.`}]}
                >
                    {inputNode}
                </Form.Item>
            )
        } else {
            childNode = (
                <div
                    className="editable-cell-value-wrap"
                    // style={{paddingInlineEnd: 12}}
                    onClick={toggleEdit}
                >
                    {children}
                </div>
            );
        }
    }

    return <td {...props}>{childNode}</td>;
}

export const components = {
    body: {
        row: EditableRow,
        cell: EditableCell,
    },
};