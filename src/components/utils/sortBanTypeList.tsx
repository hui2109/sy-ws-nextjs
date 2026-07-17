import {LatterBantype} from "@/configs/general";

export function sortBanTypeList(bansList: string[]): string[] {
    const latterBanTypeOrder = new Map<string, number>(
        LatterBantype.map((item, index) => [item, index])
    );
    const normalList: string[] = [];
    const latterList: string[] = [];

    bansList.forEach((item) => {
        if (latterBanTypeOrder.has(item)) {
            latterList.push(item);
        } else {
            normalList.push(item);
        }
    });

    latterList.sort((a, b) => latterBanTypeOrder.get(a)! - latterBanTypeOrder.get(b)!);

    return [...normalList, ...latterList];
}