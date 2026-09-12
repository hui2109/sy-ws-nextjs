import {Badge, Popover} from "antd";
import {Dayjs} from "dayjs";
import React, {Dispatch, SetStateAction} from "react";
import {IWorkTableCellInfo} from "@/components/tables/AllWorkTable/useAllWorkTableData";
import {BanNamesForExcludePartner} from "@/configs/general";
import {useAppContext} from "@/components/hooks/AppProvider";

interface IBanBadge {
    banName: string,
    banColor: string,
    names: Array<string>,
    currentUser: string
    current: Dayjs,
    setIsInfoModalOpen: Dispatch<SetStateAction<boolean>>,
    setSelectedCell: Dispatch<SetStateAction<IWorkTableCellInfo | null>>,
}

export default function BanBadge({banName, banColor, names, currentUser, current, setIsInfoModalOpen, setSelectedCell}: IBanBadge) {
    const {resolvedTheme} = useAppContext();
    const isDark = resolvedTheme === 'dark';
    const filteredNames = names.filter(item => item !== currentUser);
    let banBadgeNames: React.JSX.Element | null;

    if (filteredNames.length === 0 || BanNamesForExcludePartner.includes(banName)) {
        banBadgeNames = null;
    } else if (filteredNames.length <= 2) {
        banBadgeNames = (
            <div className={`flex flex-col rounded-lg px-3 py-1 text-sm shadow-sm
                    max-desktop:max-w-full max-desktop:rounded-[3px] max-desktop:px-1 max-desktop:py-0.5 max-desktop:text-[9px] max-desktop:leading-3
                    ${isDark ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-700'}`}
            >
                {filteredNames.map(name => <div key={name} className="max-desktop:whitespace-nowrap">{name}</div>)}
            </div>
        );
    } else {
        const popTitle = (
            <div className={`rounded-tl-lg rounded-tr-lg bg-indigo-500 p-3 text-center font-bold text-white max-desktop:p-2 max-desktop:text-xs`}>
                {`${current.format('YYYY年M月D日')} ${banName} 班的所有人员`}
            </div>
        );
        const popContent = (
            <div className={`px-3 pb-3 max-desktop:px-2 max-desktop:pb-2 max-desktop:text-xs`}>
                {`${names.join('、')}`}
            </div>
        );

        banBadgeNames = (
            <>
                <div
                    className={`flex flex-col rounded-lg px-3 py-1 text-sm shadow-sm
                        max-desktop:max-w-full max-desktop:rounded-[3px] max-desktop:px-0.5 max-desktop:py-0.5 max-desktop:text-[9px] max-desktop:leading-3
                        ${isDark ? 'bg-slate-700 text-slate-100' : 'bg-white text-slate-700'}`}
                >
                    {filteredNames.slice(0, 2).map(name => <div key={name} className="max-desktop:whitespace-nowrap">{name}</div>)}
                </div>
                <Popover
                    content={popContent}
                    title={popTitle}
                    trigger="click"
                    classNames={{
                        container: '!p-0',
                        root: `!max-w-[400px] max-desktop:!max-w-[300px]`
                    }}
                >
                    <Badge
                        count={'等等'}
                        color={'purple'}
                        classNames={{
                            indicator: `!rounded-lg !font-bold max-desktop:!h-4 max-desktop:!rounded-[3px] max-desktop:!px-1 max-desktop:!text-[9px] max-desktop:!leading-4`,
                        }}
                        style={{cursor: 'pointer', marginTop: '5px'}}
                    />
                </Popover>
            </>
        )
    }

    return (
        <div className={`flex w-fit flex-col items-center gap-2 rounded-2xl border px-5 py-4 shadow-sm
            max-desktop:w-full max-desktop:max-w-full max-desktop:gap-1 max-desktop:rounded-[5px] max-desktop:px-1 max-desktop:py-1
            ${isDark ? 'border-slate-700 bg-slate-800/60' : 'border-slate-200 bg-slate-50'}`}>
            <Badge
                count={banName}
                color={banColor}
                classNames={{
                    indicator: `!rounded-lg !font-bold !shadow-sm
                        max-desktop:!h-4 max-desktop:!max-w-[44px] max-desktop:!truncate max-desktop:!rounded-[3px] max-desktop:!px-0.5 max-desktop:!text-[9px] max-desktop:!leading-4`,
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsInfoModalOpen(true);
                    setSelectedCell({
                        name: currentUser,
                        day: current,
                        bans: [banName]
                    });
                }}
            />

            {banBadgeNames && (
                <div className="flex max-w-full flex-col items-center gap-1 max-desktop:gap-0.5">
                    {banBadgeNames}
                </div>
            )}
        </div>
    );
}
