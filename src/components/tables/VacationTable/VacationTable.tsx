import {useEffect, useState} from "react";
import {Table} from "antd";
import {IScheduleCellInfo} from "@/components/tables/ScheduleTable/getScheduleTableData";
import getVacationTableData, {IVacationTableData} from "@/components/tables/VacationTable/getVacationTableData";

export default function VacationTable({selectedCell}: { selectedCell: IScheduleCellInfo }) {
    const [loading, setLoading] = useState(true);
    const [vacationTableData, setvacationTableData] = useState<IVacationTableData>({dataSource: [], columns: []});

    useEffect(() => {
        getVacationTableData(selectedCell.name, selectedCell.day).then(data => {
            setvacationTableData(data);
            setLoading(false);
        });
        return () => setLoading(true);
    }, [selectedCell.name, selectedCell.day])

    return (
        <Table
            loading={loading}
            columns={vacationTableData.columns}
            dataSource={vacationTableData.dataSource}
            pagination={false}
            column={{align: 'center'}}
            size={"small"}
            bordered
        />
    );

}