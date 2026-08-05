import React, {Dispatch, SetStateAction} from "react";
import {Checkbox, InputNumber} from "antd";

export function DuplicateCheck({text, duplicateCheck, duplicateNum, setDuplicateCheck, setDuplicateNum}: {
    text: string;
    duplicateCheck: boolean;
    duplicateNum: number;
    setDuplicateCheck: Dispatch<SetStateAction<boolean>>;
    setDuplicateNum: Dispatch<SetStateAction<number>>;
}) {
    return (
        <div className='flex items-center justify-center gap-2'>
            <Checkbox
                checked={duplicateCheck}
                onChange={(e) => setDuplicateCheck(e.target.checked)}
            >
                {text}
            </Checkbox>
            <InputNumber
                value={duplicateNum}
                onChange={(value) => setDuplicateNum(value ?? 5)}
                mode='spinner'
                min={2}
                max={10}
                style={{width: 100}}
                size='small'
                disabled={!duplicateCheck}
            />
            <span>次</span>
        </div>
    );
}