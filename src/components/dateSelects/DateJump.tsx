'use client';

import React, {useState} from 'react';
import {Button, DatePicker, Space} from 'antd';
import dayjs from "dayjs";

type Picker = 'month' | 'year';

export default function DateJump({picker}: { picker: Picker }) {
    const format = picker === 'month' ? 'YYYY年M月' : 'YYYY年';
    const [current, setCurrent] = useState<dayjs.Dayjs>(dayjs());

    function onChange(date: dayjs.Dayjs | null): void {
        if (date) setCurrent(date);
    }

    function handlePreClick() {
        setCurrent(prev => prev.subtract(1, picker));  // picker 直接是 'month' 或 'year'
    }

    function handleNexClick() {
        setCurrent(prev => prev.add(1, picker));
    }

    return (
        <Space>
            <Button type="primary" onClick={handlePreClick}>
                {picker === 'month' ? '上个月' : '上一年'}
            </Button>
            <DatePicker
                value={current}           // 受控模式
                onChange={onChange}
                picker={picker}
                format={format}
                inputReadOnly={true}
                allowClear={false}
            />
            <Button type="primary" onClick={handleNexClick}>
                {picker === 'month' ? '下个月' : '下一年'}
            </Button>
        </Space>
    )
}
