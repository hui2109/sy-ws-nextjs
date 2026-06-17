import {Dayjs} from "dayjs";
import {Badge, TableColumnsType} from "antd";
import {getWSbyMonth} from "../WorkSchedule/getWSbyMonth";
import {Weekdays} from "@/configs/general";

export interface IScheduleTableData {
    dataSource: { key: string, name: string, [date: string]: string[] | string }[];
    columns: TableColumnsType;
}

export async function getScheduleTableData(date: Dayjs): Promise<IScheduleTableData> {
    const dbData = await getWSbyMonth(date.format('YYYY-MM-DD'));
    const daysInMonth = Array.from(
        {length: date.daysInMonth()},
        (_, i) => date.date(i + 1)
    );

    const dataSource = Object.entries(dbData).map(([personName, scheduleInfo]) => {
        const rowData: { key: string, name: string, [date: string]: string[] | string } = {
            key: personName,
            name: personName,
        };

        for (const [string_date, bansList] of Object.entries(scheduleInfo)) {
            rowData[string_date] = bansList;
        }

        return rowData;
    });

    const columns: TableColumnsType = daysInMonth.map(day => {
        const index = day.format('YYYY-MM-DD');
        return {
            title: (
                <div className='flex flex-col items-center font-bold'>
                    <span>{Weekdays[day.day()]}</span>
                    <span>{day.date()}</span>
                </div>
            ),
            dataIndex: index,
            render: (text: string, record, index) => {
                return (
                    <Badge count={text} color='blue' onClick={() => {
                        // console.log(text, record, index);
                    }}/>
                )
            },
            onCell: (record, ix) => ({
                style: {cursor: 'pointer'},
                onClick: () => {
                    console.log(record.name, day, record[index])
                }
            })
        }
    });
    columns.unshift({
        title: (
            <div className='font-bold text-green-600'>
                已发布
            </div>
        ),
        dataIndex: "name",
        fixed: 'start',
        width: 80,
        render: (text) => {
            return (
                <div className='font-bold'>
                    {text}
                </div>
            )
        }
    });

    return {
        dataSource,
        columns,
    }
}