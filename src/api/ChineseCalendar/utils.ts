import dayjs, {type Dayjs} from "dayjs";
import {type HolidayName, holidays, in_lieu_days, workdays,} from "./constants";
import {SOLAR_TERM_INFO, SOLAR_TERMS_C_NUMS, SOLAR_TERMS_DELTA, SOLAR_TERMS_MONTH, solarTermDeltaKey, SolarTerms,} from "./solar_terms";

function wrapDate(value: Dayjs): Dayjs {
    if (!dayjs.isDayjs(value) || !value.isValid()) {
        throw new TypeError("unsupported type, expected a valid Dayjs object");
    }
    return value.startOf("day");
}

export function toDateKey(value: Dayjs): string {
    return wrapDate(value).format("YYYY-MM-DD");
}

const holidayYears = [...holidays.keys()].map((date) => date.year());
const MIN_SUPPORTED_YEAR = Math.min(...holidayYears);
const MAX_SUPPORTED_YEAR = Math.max(...holidayYears);

function pythonWeekday(value: Dayjs): number {
    return (wrapDate(value).day() + 6) % 7;
}

function validateDate(date: Dayjs): Dayjs;
function validateDate(...dates: Dayjs[]): Dayjs[];
function validateDate(...dates: Dayjs[]): Dayjs | Dayjs[] {
    if (dates.length !== 1) {
        return dates.map((date) => validateDate(date) as Dayjs);
    }

    const date = wrapDate(dates[0]);
    const year = date.year();

    if (year < MIN_SUPPORTED_YEAR || year > MAX_SUPPORTED_YEAR) {
        throw new RangeError(
            `no available data for year ${year}, only year between ` +
            `[${MIN_SUPPORTED_YEAR}, ${MAX_SUPPORTED_YEAR}] supported`
        );
    }

    return date;
}

export function isHoliday(date: Dayjs): boolean {
    return !isWorkday(date);
}

export function isWorkday(date: Dayjs): boolean {
    const normalized = validateDate(date) as Dayjs;
    const weekday = pythonWeekday(normalized);

    return (
        workdays.has(normalized) ||
        (weekday <= 4 && !holidays.has(normalized))
    );
}

export function isInLieu(date: Dayjs): boolean {
    return in_lieu_days.has(validateDate(date) as Dayjs);
}

export function getHolidayDetail(
    date: Dayjs
): [boolean, HolidayName | null] {
    const normalized = validateDate(date) as Dayjs;

    const workdayHoliday = workdays.get(normalized);
    if (workdayHoliday !== undefined) {
        return [false, workdayHoliday];
    }

    const holiday = holidays.get(normalized);
    if (holiday !== undefined) {
        return [true, holiday];
    }

    return [pythonWeekday(normalized) > 4, null];
}

export function getDates(start: Dayjs, end: Dayjs): Dayjs[] {
    const first = wrapDate(start);
    const last = wrapDate(end);

    if (first.isAfter(last, "day")) return [];

    const result: Dayjs[] = [];
    let current = first;

    while (!current.isAfter(last, "day")) {
        result.push(current);
        current = current.add(1, "day");
    }

    return result;
}

export function getHolidays(
    start: Dayjs,
    end: Dayjs,
    includeWeekends = true
): Dayjs[] {
    const [first, last] = validateDate(start, end) as Dayjs[];

    if (includeWeekends) {
        return getDates(first, last).filter(isHoliday);
    }

    return getDates(first, last).filter((date) => holidays.has(date));
}

export function getWorkdays(
    start: Dayjs,
    end: Dayjs,
    includeWeekends = true
): Dayjs[] {
    const [first, last] = validateDate(start, end) as Dayjs[];

    if (includeWeekends) {
        return getDates(first, last).filter(isWorkday);
    }

    return getDates(first, last).filter(
        (date) => isWorkday(date) && pythonWeekday(date) < 5
    );
}

export function findWorkday(
    deltaDays = 0,
    date: Dayjs = dayjs()
): Dayjs {
    let current = wrapDate(date);
    let remaining = Math.trunc(deltaDays);

    if (remaining >= 0) remaining += 1;
    const sign = remaining >= 0 ? 1 : -1;

    for (let i = 0; i < Math.abs(remaining); i++) {
        if (remaining < 0 || i > 0) {
            current = current.add(sign, "day");
        }

        while (!isWorkday(current)) {
            current = current.add(sign, "day");
        }
    }

    return current;
}

export function getSolarTerms(
    start: Dayjs,
    end: Dayjs
): Array<[Dayjs, string]> {
    const first = wrapDate(start);
    const last = wrapDate(end);

    if (
        first.year() < 1900 ||
        first.year() > 2100 ||
        last.year() < 1900 ||
        last.year() > 2100
    ) {
        throw new RangeError("only year between [1900, 2100] supported");
    }

    const D = 0.2422;
    const result: Array<[Dayjs, string]> = [];

    let year = first.year();
    let month = first.month() + 1;

    while (
        year < last.year() ||
        (year === last.year() && month <= last.month() + 1)
        ) {
        const terms = SOLAR_TERMS_MONTH[month];

        for (const solarTerm of terms) {
            const nums = SOLAR_TERMS_C_NUMS[solarTerm];
            let C = year < 2000 ? nums[0] : nums[1];

            const usesPreviousCenturyC =
                solarTerm === SolarTerms.lesser_cold ||
                solarTerm === SolarTerms.greater_cold ||
                solarTerm === SolarTerms.the_beginning_of_spring ||
                solarTerm === SolarTerms.rain_water;

            if (year === 2000 && usesPreviousCenturyC) {
                C = nums[0];
            }

            const Y = year % 100;
            let L = Math.trunc(Y / 4);

            if (usesPreviousCenturyC) {
                L = Math.trunc((Y - 1) / 4);
            }

            let day = Math.trunc(Y * D + C) - L;
            const delta = SOLAR_TERMS_DELTA.get(
                solarTermDeltaKey(year, solarTerm)
            );

            if (delta !== undefined) day += delta;

            const date = dayjs(
                `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            ).startOf("day");

            if (date.isBefore(first, "day") || date.isAfter(last, "day")) {
                continue;
            }

            result.push([date, SOLAR_TERM_INFO[solarTerm].chinese]);
        }

        if (month === 12) {
            year += 1;
            month = 1;
        } else {
            month += 1;
        }
    }

    return result;
}

export const is_holiday = isHoliday;
export const is_workday = isWorkday;
export const is_in_lieu = isInLieu;
export const get_holiday_detail = getHolidayDetail;
export const get_dates = getDates;
export const get_holidays = getHolidays;
export const get_workdays = getWorkdays;
export const find_workday = findWorkday;
export const get_solar_terms = getSolarTerms;

export const SUPPORTED_YEAR_RANGE = [
    MIN_SUPPORTED_YEAR,
    MAX_SUPPORTED_YEAR,
] as const;
