'use client';

import React, {Dispatch, SetStateAction, useState} from 'react';
import {Button, DatePicker, Space} from 'antd';
import dayjs, {Dayjs} from "dayjs";

type Picker = 'month' | 'year';

interface IDateJumpProps {
    picker: Picker;
    current: Dayjs;
    setCurrent: Dispatch<SetStateAction<Dayjs>>;
}

export default function DateJump({picker, current, setCurrent}: IDateJumpProps) {
    const format = picker === 'month' ? 'YYYY年M月' : 'YYYY年';
    const [open, setOpen] = useState<boolean>(false);  // 控制弹出层

    function onChange(date: Dayjs | null): void {
        if (date) setCurrent(date);
    }

    function handlePreClick() {
        setCurrent(prev => prev.subtract(1, picker));
    }

    function handleNexClick() {
        setCurrent(prev => prev.add(1, picker));
    }

    function handleJumpToToday() {
        setCurrent(dayjs());
        setTimeout(() => setOpen(false), 100);
    }

    const extraFooter = (
        <div className="flex justify-between">
            <Button type="default" onClick={handleJumpToToday} size="small">
                选择今天
            </Button>
            <Button type="default" onClick={() => setOpen(false)} size="small">
                关闭
            </Button>
        </div>
    );

    return (
        <Space>
            <Button type="primary" onClick={handlePreClick} size="small">
                {picker === 'month' ? '上个月' : '上一年'}
            </Button>
            <DatePicker
                value={current}                      // 受控日期模式
                open={open}                          // 受控弹出层
                onOpenChange={setOpen}               // 点击输入框、外部点击时同步
                onChange={onChange}
                picker={picker}
                format={format}
                inputReadOnly={true}
                allowClear={false}
                renderExtraFooter={() => extraFooter}
                size="small"
                classNames={{input: 'text-center'}}
            />
            <Button type="primary" onClick={handleNexClick} size="small">
                {picker === 'month' ? '下个月' : '下一年'}
            </Button>
        </Space>
    )
}
