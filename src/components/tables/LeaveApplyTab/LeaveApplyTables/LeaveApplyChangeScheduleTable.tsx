// import {Dayjs} from "dayjs";
// import getDatesBetween from "@/components/utils/getDatesBetween";
// import {Badge, Select, Table, TableColumnsType} from "antd";
// import NullText from "@/components/others/NullText";
// import {useAppContext} from "@/components/hooks/AppProvider";
// import {sortBanTypeList} from "@/components/utils/sortBanTypeList";
//
// interface ILeaveApplyChangeScheduleTable {
//     personDateBansMap: Record<string, Record<string, [string, number][]>>,
//     banTypeColorMap: Record<string, string>,
//     dateRange: [Dayjs, Dayjs],
//     targetStaff: string,
//     validBanNames: string[]
// }
//
// export default function LeaveApplyChangeScheduleTable({personDateBansMap, banTypeColorMap, dateRange, targetStaff, validBanNames}: ILeaveApplyChangeScheduleTable) {
//     const {resolvedTheme} = useAppContext();
//     const isDark = resolvedTheme === 'dark';
//     const daysInRange = getDatesBetween(dateRange[0], dateRange[1]);
//
//     const dataSource = daysInRange.map(day => {
//         const format_date = day.format('YYYY-MM-DD');
//         return {
//             key: format_date,
//             dt: format_date,
//             myBan: personDateBansMap[targetStaff]?.[format_date],
//         }
//     });
//
//     const columns: TableColumnsType = [
//         {
//             title: '日期',
//             dataIndex: 'dt',
//             width: 150,
//             align: 'center',
//             render: (date: string) => (
//                 <span className="font-medium tabular-nums">{date}</span>
//             ),
//         },
//         {
//             title: `${targetStaff} 应该上`,
//             dataIndex: 'myBan',
//             width: 150,
//             align: 'center',
//             render: (bans: [string, number][] | undefined) => {
//                 if (!bans) return <NullText/>;
//                 const banNames = sortBanTypeList(bans.map(ban => ban[0]));
//                 return (
//                     <div className="flex flex-col items-center justify-center gap-1.5">
//                         {banNames.map((banName) => (
//                             <Badge
//                                 key={banName}
//                                 count={banName}
//                                 color={banTypeColorMap[banName]}
//                                 classNames={{indicator: '!rounded-lg !font-bold cursor-pointer'}}
//                             />
//                         ))}
//                     </div>
//                 );
//             },
//         },
//         {
//             title: '改成',
//             width: 250,
//             align: 'center',
//             render: () => (
//                 <Select
//                     placeholder="请选择调整后的排班"
//                     options={validBanNames.map(banName => ({
//                         label: banName,
//                         value: banName,
//                     }))}
//                     showSearch={{
//                         optionFilterProp: 'value',
//                         filterSort: (optionA, optionB) =>
//                             (optionA?.value ?? '').toLowerCase().localeCompare((optionB?.value ?? '').toLowerCase()),
//                     }}
//                     mode='multiple'
//                     classNames={{popup: {listItem: 'text-center'}}}
//                     className="w-full max-w-[200px]"
//                 />
//             ),
//         },
//     ];
//
//     return (
//         <div className={`overflow-hidden rounded-2xl border shadow-sm transition-colors ${
//             isDark
//                 ? 'border-slate-700/80 bg-slate-900/70 shadow-black/20'
//                 : 'border-slate-200 bg-white shadow-slate-200/70'
//         }`}>
//             <div className={`flex justify-between items-center gap-2 border-b px-4 py-3.5 ${
//                 isDark
//                     ? 'border-slate-700/80 bg-slate-800/80'
//                     : 'border-slate-200 bg-slate-50/90'
//             }`}>
//                 <div className="border-l-4 border-blue-500 pl-3">
//                     <h3 className={`text-base font-semibold ${
//                         isDark ? 'text-slate-100' : 'text-slate-900'
//                     }`}>
//                         改班明细
//                     </h3>
//                     <p className={`mt-0.5 text-xs ${
//                         isDark ? 'text-slate-400' : 'text-slate-500'
//                     }`}>
//                         核对 {targetStaff} 当前排班，并逐日选择调整后的班次
//                     </p>
//                 </div>
//                 <div className={`w-fit rounded-full border px-3 py-1 text-xs font-medium ${
//                     isDark
//                         ? 'border-slate-600 text-slate-300'
//                         : 'border-slate-300 text-slate-600'
//                 }`}
//                 >
//                     共 {daysInRange.length} 天
//                 </div>
//             </div>
//             <Table
//                 columns={columns}
//                 dataSource={dataSource}
//                 scroll={{x: 'max-content', y: 750}}
//                 pagination={false}
//                 size="middle"
//                 bordered
//                 className={`overflow-hidden rounded-xl p-4 ${
//                     isDark
//                         ? '[&_.ant-table]:!bg-slate-900/30 [&_.ant-table-thead_.ant-table-cell]:!bg-slate-800/80 [&_.ant-table-tbody_.ant-table-cell]:!bg-slate-900/30 [&_.ant-table-cell]:!border-slate-700/80 [&_.ant-table-tbody>tr:hover>td]:!bg-slate-800/70'
//                         : '[&_.ant-table]:!bg-white [&_.ant-table-thead_.ant-table-cell]:!bg-slate-50 [&_.ant-table-tbody_.ant-table-cell]:!bg-white [&_.ant-table-cell]:!border-slate-200 [&_.ant-table-tbody>tr:hover>td]:!bg-slate-50'
//                 }`}
//             />
//         </div>
//     );
// }
