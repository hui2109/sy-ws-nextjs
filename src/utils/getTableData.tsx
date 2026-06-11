import {Badge, TableColumnsType} from 'antd';
import dayjs from "dayjs";
import {Weekdays} from "@/configs/general";

export function getTableData() {
    const serverData = simulateServer();
    const daysInMonth = Array.from(
        {length: dayjs().daysInMonth()},
        (_, i) => dayjs().date(i + 1)
    );

    const dataSource = serverData.map(personInfo => {
        const name = Object.keys(personInfo)[0];

        const rowData: { key: string; [date: string]: string } = {
            key: name,
            name: name,
        };

        for (const day of daysInMonth) {
            const string_date = day.format('YYYY-MM-DD');
            rowData[string_date] = personInfo[name][string_date];
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
                // console.log(text, record, index);

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


function simulateServer() {
    const daysInMonth = Array.from(
        {length: dayjs().daysInMonth()},
        (_, i) => dayjs().date(i + 1)
    );
    const personnel = ["叶荣", "闫昱萤", "戴梦莹", "曾小洲", "杨星", "郑霞", "金小靖", "肖贵珍", "赵仲", "付昱东", "黄文军", "黄发生", "杨鹏", "余涛", "王吉锐", "唐晓燕", "余翔", "谭林", "徐博", "康正樾", "凌子涵", "尹红科", "廖中凡", "张旭辉", "贺思程"]

    return personnel.map(personName => {
        const personData: { [date: string]: string } = {}
        for (const day of daysInMonth) {
            personData[day.format('YYYY-MM-DD')] = 'S1'
        }
        return {
            [personName]: personData
        };
    });
}