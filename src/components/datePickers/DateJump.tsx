'use client';

import React from 'react';
import type {DatePickerProps} from 'antd';
import {DatePicker} from 'antd';

type Picker = 'month' | 'year';

export default function DateJump({picker}: { picker: Picker }) {
    // 仅支持month和year模式
    const onChange: DatePickerProps['onChange'] = (date, dateString) => {
        console.log(date, dateString);
    };

    return (
        <DatePicker onChange={onChange} picker={picker}/>
    )
}