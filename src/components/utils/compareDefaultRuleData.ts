import {pinyin} from "pinyin-pro";
import {IRuleData} from "@/components/tables/HolidaySettingTable/useHSTableData";

const zhCollator = new Intl.Collator("zh-CN", {
    sensitivity: "base",
});

const enCollator = new Intl.Collator("en", {
    sensitivity: "base",
});

/**
 * 获取姓名排序用的拼音。
 *
 * surname: "head" 会按照姓氏读音处理第一个字，
 * 例如：
 * 曾乐乐 -> zeng le le
 */
function getNamePinyin(name: string): string {
    return pinyin(name.trim(), {
        toneType: "none",
        surname: "head",
    }).replace(/\s+/g, "").toLowerCase();
}

/**
 * 姓名排序：
 * 1. 先按完整姓名拼音排序
 * 2. 拼音相同时，再按原姓名排序
 *
 * 注意：
 * 只有姓名完全相同时才返回 0，
 * 这样才会继续比较 enabled。
 */
export function compareName(a: string, b: string): number {
    if (a === b) return 0;

    const aPinyin = getNamePinyin(a);
    const bPinyin = getNamePinyin(b);

    const pinyinCompare = enCollator.compare(aPinyin, bPinyin);

    if (pinyinCompare !== 0) {
        return pinyinCompare;
    }

    // 处理同音不同字，例如“张三 / 章三”
    return zhCollator.compare(a, b);
}

/**
 * 班种名称排序优先级：
 *
 * 放射假
 * 年假
 * 调休假
 * 其他班种……
 * 去年余假
 */
const BAN_NAME_PRIORITY = new Map<string, number>([
    ["放射假", 0],
    ["年假", 1],
    ["调休假", 2],
    ["去年余假", 4],
]);

function compareBanName(a: string, b: string): number {
    const aPriority = BAN_NAME_PRIORITY.get(a) ?? 3;
    const bPriority = BAN_NAME_PRIORITY.get(b) ?? 3;

    if (aPriority !== bPriority) {
        return aPriority - bPriority;
    }

    // 同级班种按中文名称排序
    return zhCollator.compare(a, b);
}

export default function compareDefaultRuleData(a: IRuleData, b: IRuleData): number {
    // 1. 姓名：按姓名拼音升序排列
    const nameCompare = compareName(a.name, b.name);
    if (nameCompare !== 0) {
        return nameCompare;
    }

    // 2. 是否启用：启用的排在前面
    const enabledCompare = Number(b.enabled) - Number(a.enabled);
    if (enabledCompare !== 0) {
        return enabledCompare;
    }

    // 3. 开始日期：越早排在越后面
    // YYYY-MM-DD 可以直接进行字符串比较
    const startDateCompare = b.startDate.localeCompare(a.startDate);
    if (startDateCompare !== 0) {
        return startDateCompare;
    }

    // 4. 班种名称
    return compareBanName(a.banName, b.banName);
}
