import dayjs from "dayjs";
import {Badge, Popover} from "antd";

export interface IBanTableRow {
    key: string;
    date: string;

    [banName: string]: string[] | string;
}

export function getPeopleBadge(personNames: string[], record: IBanTableRow, banName: string) {
    const length = personNames.length;
    const currDate = dayjs(record.date);

    switch (length) {
        case 0:
            return <Badge count={'暂无排班'} color={'gray'} classNames={{indicator: '!rounded-lg !font-bold'}}/>
        case 1:
            return (
                <div className='flex flex-col items-center justify-center gap-1'>
                    <Badge count={'1人'} color={'blue'} classNames={{indicator: '!rounded-lg !font-bold'}}/>
                    <div>{personNames[0]}</div>
                </div>
            );
        case 2:
            return (
                <div className='flex flex-col items-center justify-center gap-1'>
                    <Badge count={'2人'} color={'green'} classNames={{indicator: '!rounded-lg !font-bold'}}/>
                    <div>{personNames[0]}</div>
                    <div>{personNames[1]}</div>
                </div>
            );
        case 3:
            return (
                <div className='flex flex-col items-center justify-center gap-1'>
                    <Badge count={'3人'} color={'gold'} classNames={{indicator: '!rounded-lg !font-bold'}}/>
                    <div>{personNames[0]}</div>
                    <div>{personNames[1]}</div>
                    <div>{personNames[2]}</div>
                </div>
            )
        default:
            const popTitle = (
                <div className={'font-bold bg-indigo-500 text-white p-3 rounded-tl-lg rounded-tr-lg text-center'}>
                    {`${currDate.format('YYYY年M月D日')} ${banName} 班的所有人员`}
                </div>
            );
            const popContent = (
                <div className={'px-3 pb-3'}>
                    {`${personNames.join('、')}`}
                </div>
            );

            return (
                <div className='flex flex-col items-center justify-center gap-1'>
                    <Badge count={`${length}人`} color={'magenta'} classNames={{indicator: '!rounded-lg !font-bold'}}/>
                    <div>{personNames[0]}</div>
                    <div>{personNames[1]}</div>
                    <div>{personNames[2]}</div>
                    <Popover
                        content={popContent}
                        title={popTitle}
                        trigger="click"
                        classNames={{
                            container: '!p-0',
                            root: '!max-w-[400px]'
                        }}
                    >
                        <Badge count={'等等'} color={'purple'} classNames={{indicator: '!rounded-lg !font-bold'}} style={{cursor: 'pointer'}}/>
                    </Popover>
                </div>
            )
    }
}