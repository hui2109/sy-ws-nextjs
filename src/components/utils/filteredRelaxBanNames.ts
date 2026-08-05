import {sortBanTypeList} from "@/components/utils/sortBanTypeList";

export function filteredRelaxBanNames(banNames: string[]) {
    const exclude_banNames = ['补假', '调休假'];
    return sortBanTypeList(banNames.filter(banName => banName.endsWith('假') && !exclude_banNames.includes(banName)));
}