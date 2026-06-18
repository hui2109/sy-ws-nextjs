'use client';

import {Button} from 'antd';
import React, {useState} from 'react';

type ClickedButtonColor =
    | 'blue'
    | 'purple'
    | 'cyan'
    | 'green'
    | 'magenta'
    | 'pink'
    | 'red'
    | 'orange'
    | 'yellow'
    | 'volcano'
    | 'geekblue'
    | 'lime'
    | 'gold';

export default function ToggleButton({clickedButtonColor = 'blue', icon, children}:
                                     { clickedButtonColor?: ClickedButtonColor, icon?: React.ReactNode, children?: React.ReactNode; }) {
    const [active, setActive] = useState(false);

    return (
        <Button
            color={active ? clickedButtonColor : 'default'}
            variant={active ? 'solid' : 'outlined'}
            icon={icon}
            onClick={() => setActive((prev) => !prev)}
        >
            {children}
        </Button>
    );
}
