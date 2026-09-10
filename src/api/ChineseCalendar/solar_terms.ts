// TypeScript port of solar_terms.py.
// No runtime dependencies.

export const SolarTerms = {
    the_beginning_of_spring: "the_beginning_of_spring",
    rain_water: "rain_water",
    the_waking_of_insects: "the_waking_of_insects",
    the_spring_equinox: "the_spring_equinox",
    pure_brightness: "pure_brightness",
    grain_rain: "grain_rain",
    the_beginning_of_summer: "the_beginning_of_summer",
    lesser_fullness_of_grain: "lesser_fullness_of_grain",
    grain_in_beard: "grain_in_beard",
    the_summer_solstice: "the_summer_solstice",
    lesser_heat: "lesser_heat",
    greater_heat: "greater_heat",
    the_beginning_of_autumn: "the_beginning_of_autumn",
    the_end_of_heat: "the_end_of_heat",
    white_dew: "white_dew",
    the_autumn_equinox: "the_autumn_equinox",
    code_dew: "code_dew",
    frost_descent: "frost_descent",
    the_beginning_of_winter: "the_beginning_of_winter",
    lesser_snow: "lesser_snow",
    greater_snow: "greater_snow",
    the_winter_solstice: "the_winter_solstice",
    lesser_cold: "lesser_cold",
    greater_cold: "greater_cold",
} as const;

export type SolarTerm = (typeof SolarTerms)[keyof typeof SolarTerms];

export interface SolarTermInfo {
    readonly english: string;
    readonly chinese: string;
}

export const SOLAR_TERM_INFO: Record<SolarTerm, SolarTermInfo> = {
    [SolarTerms.the_beginning_of_spring]: {english: "the Beginning of Spring", chinese: "立春"},
    [SolarTerms.rain_water]: {english: "Rain Water", chinese: "雨水"},
    [SolarTerms.the_waking_of_insects]: {english: "the Waking of Insects", chinese: "惊蛰"},
    [SolarTerms.the_spring_equinox]: {english: "the Spring Equinox", chinese: "春分"},
    [SolarTerms.pure_brightness]: {english: "Pure Brightness", chinese: "清明"},
    [SolarTerms.grain_rain]: {english: "Grain Rain", chinese: "谷雨"},
    [SolarTerms.the_beginning_of_summer]: {english: "the Beginning of Summer", chinese: "立夏"},
    [SolarTerms.lesser_fullness_of_grain]: {english: "Lesser Fullness of Grain", chinese: "小满"},
    [SolarTerms.grain_in_beard]: {english: "Grain in Beard", chinese: "芒种"},
    [SolarTerms.the_summer_solstice]: {english: "the Summer Solstice", chinese: "夏至"},
    [SolarTerms.lesser_heat]: {english: "Lesser Heat", chinese: "小暑"},
    [SolarTerms.greater_heat]: {english: "Greater Heat", chinese: "大暑"},
    [SolarTerms.the_beginning_of_autumn]: {english: "the Beginning of Autumn", chinese: "立秋"},
    [SolarTerms.the_end_of_heat]: {english: "the End of Heat", chinese: "处暑"},
    [SolarTerms.white_dew]: {english: "White Dew", chinese: "白露"},
    [SolarTerms.the_autumn_equinox]: {english: "the Autumn Equinox", chinese: "秋分"},
    [SolarTerms.code_dew]: {english: "Cold Dew", chinese: "寒露"},
    [SolarTerms.frost_descent]: {english: "Frost's Descent", chinese: "霜降"},
    [SolarTerms.the_beginning_of_winter]: {english: "the Beginning of Winter", chinese: "立冬"},
    [SolarTerms.lesser_snow]: {english: "Lesser Snow", chinese: "小雪"},
    [SolarTerms.greater_snow]: {english: "Greater Snow", chinese: "大雪"},
    [SolarTerms.the_winter_solstice]: {english: "the Winter Solstice", chinese: "冬至"},
    [SolarTerms.lesser_cold]: {english: "Lesser Cold", chinese: "小寒"},
    [SolarTerms.greater_cold]: {english: "Greater Cold", chinese: "大寒"},
};

// 计算节气用的 C 值。
// 2000 年的小寒、大寒、立春、雨水按照 20 世纪的 C 值来算。
export const SOLAR_TERMS_C_NUMS: Record<SolarTerm, readonly [number, number]> = {
    [SolarTerms.the_beginning_of_spring]: [4.6295, 3.87],
    [SolarTerms.rain_water]: [19.4599, 18.73],
    [SolarTerms.the_waking_of_insects]: [6.3926, 5.63],
    [SolarTerms.the_spring_equinox]: [21.4155, 20.646],
    [SolarTerms.pure_brightness]: [5.59, 4.81],
    [SolarTerms.grain_rain]: [20.888, 20.1],
    [SolarTerms.the_beginning_of_summer]: [6.318, 5.52],
    [SolarTerms.lesser_fullness_of_grain]: [21.86, 21.04],
    [SolarTerms.grain_in_beard]: [6.5, 5.678],
    [SolarTerms.the_summer_solstice]: [22.2, 21.37],
    [SolarTerms.lesser_heat]: [7.928, 7.108],
    [SolarTerms.greater_heat]: [23.65, 22.83],
    [SolarTerms.the_beginning_of_autumn]: [28.35, 7.5],
    [SolarTerms.the_end_of_heat]: [23.95, 23.13],
    [SolarTerms.white_dew]: [8.44, 7.646],
    [SolarTerms.the_autumn_equinox]: [23.822, 23.042],
    [SolarTerms.code_dew]: [9.098, 8.318],
    [SolarTerms.frost_descent]: [24.218, 23.438],
    [SolarTerms.the_beginning_of_winter]: [8.218, 7.438],
    [SolarTerms.lesser_snow]: [23.08, 22.36],
    [SolarTerms.greater_snow]: [7.9, 7.18],
    [SolarTerms.the_winter_solstice]: [22.6, 21.94],
    [SolarTerms.lesser_cold]: [6.11, 5.4055],
    [SolarTerms.greater_cold]: [20.84, 20.12],
};

// 月份和节气对应关系。
export const SOLAR_TERMS_MONTH: Record<number, readonly [SolarTerm, SolarTerm]> = {
    1: [SolarTerms.lesser_cold, SolarTerms.greater_cold],
    2: [SolarTerms.the_beginning_of_spring, SolarTerms.rain_water],
    3: [SolarTerms.the_waking_of_insects, SolarTerms.the_spring_equinox],
    4: [SolarTerms.pure_brightness, SolarTerms.grain_rain],
    5: [SolarTerms.the_beginning_of_summer, SolarTerms.lesser_fullness_of_grain],
    6: [SolarTerms.grain_in_beard, SolarTerms.the_summer_solstice],
    7: [SolarTerms.lesser_heat, SolarTerms.greater_heat],
    8: [SolarTerms.the_beginning_of_autumn, SolarTerms.the_end_of_heat],
    9: [SolarTerms.white_dew, SolarTerms.the_autumn_equinox],
    10: [SolarTerms.code_dew, SolarTerms.frost_descent],
    11: [SolarTerms.the_beginning_of_winter, SolarTerms.lesser_snow],
    12: [SolarTerms.greater_snow, SolarTerms.the_winter_solstice],
};

export function solarTermDeltaKey(year: number, term: SolarTerm): string {
    return `${year}:${term}`;
}

// 有些节气使用公式计算不够准确，需要进行偏移。
export const SOLAR_TERMS_DELTA = new Map<string, number>([
    [solarTermDeltaKey(2026, SolarTerms.rain_water), -1],
    [solarTermDeltaKey(2084, SolarTerms.the_spring_equinox), 1],
    [solarTermDeltaKey(1911, SolarTerms.the_beginning_of_summer), 1],
    [solarTermDeltaKey(2008, SolarTerms.lesser_fullness_of_grain), 1],
    [solarTermDeltaKey(1902, SolarTerms.grain_in_beard), 1],
    [solarTermDeltaKey(1928, SolarTerms.the_summer_solstice), 1],
    [solarTermDeltaKey(1925, SolarTerms.lesser_heat), 1],
    [solarTermDeltaKey(2016, SolarTerms.lesser_heat), 1],
    [solarTermDeltaKey(1922, SolarTerms.greater_heat), 1],
    [solarTermDeltaKey(2002, SolarTerms.the_beginning_of_autumn), 1],
    [solarTermDeltaKey(1927, SolarTerms.white_dew), 1],
    [solarTermDeltaKey(1942, SolarTerms.the_autumn_equinox), 1],
    [solarTermDeltaKey(2089, SolarTerms.frost_descent), 1],
    [solarTermDeltaKey(2089, SolarTerms.the_beginning_of_winter), 1],
    [solarTermDeltaKey(1978, SolarTerms.lesser_snow), 1],
    [solarTermDeltaKey(1954, SolarTerms.greater_snow), 1],
    [solarTermDeltaKey(1918, SolarTerms.the_winter_solstice), -1],
    [solarTermDeltaKey(2021, SolarTerms.the_winter_solstice), -1],
    [solarTermDeltaKey(1982, SolarTerms.lesser_cold), 1],
    [solarTermDeltaKey(2019, SolarTerms.lesser_cold), -1],
    [solarTermDeltaKey(2000, SolarTerms.greater_cold), 1],
    [solarTermDeltaKey(2082, SolarTerms.greater_cold), 1],
]);

export function getSolarTermChinese(term: SolarTerm): string {
    return SOLAR_TERM_INFO[term].chinese;
}
