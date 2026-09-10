#!/usr/bin/env node
"use strict";

//eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require("node:fs");
//eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require("node:path");

/**
 * Convert chinese_calendar's generated constants.py into constants.ts.
 * All date values in the generated TypeScript are Dayjs objects.
 *
 * @param {string} inputPath path to constants.py
 * @param {string} outputPath path to constants.ts
 */
function convertConstantsPyToTs(inputPath, outputPath) {
    const source = fs.readFileSync(inputPath, "utf8");

    const holidayDefs = parseHolidayDefinitions(source);
    const holidays = parseDateMap(source, "holidays");
    const workdays = parseDateMap(source, "workdays");
    const inLieuDays = parseDateMap(source, "in_lieu_days");

    const knownKeys = new Set(holidayDefs.map((x) => x.key));
    for (const [mapName, entries] of [
        ["holidays", holidays],
        ["workdays", workdays],
        ["in_lieu_days", inLieuDays],
    ]) {
        for (const entry of entries) {
            if (!knownKeys.has(entry.holidayKey)) {
                throw new Error(
                    `${mapName}: unknown Holiday.${entry.holidayKey}; constants.py format may have changed`
                );
            }
        }
    }

    fs.writeFileSync(
        outputPath,
        renderTypeScript({holidayDefs, holidays, workdays, inLieuDays}),
        "utf8"
    );

    return {
        holidayTypes: holidayDefs.length,
        holidays: holidays.length,
        workdays: workdays.length,
        inLieuDays: inLieuDays.length,
    };
}

function parseHolidayDefinitions(source) {
    const classStart = source.indexOf("class Holiday(Enum):");
    const mapStart = source.indexOf("\nholidays = {", classStart);
    if (classStart < 0 || mapStart < 0) {
        throw new Error("Could not find `class Holiday(Enum)` followed by `holidays = {`");
    }

    const defs = [];
    const lines = source.slice(classStart, mapStart).split(/\r?\n/);

    for (const line of lines) {
        const m = line.match(/^\s{4}([A-Za-z_]\w*)\s*=\s*(.+)$/);
        if (!m) continue;

        const key = m[1];
        const rhs = m[2].trim();
        if (!(rhs.startsWith('"') || rhs.startsWith("'"))) continue;

        defs.push({key, ...parseHolidayTuple(rhs, key)});
    }

    if (defs.length === 0) {
        throw new Error("No Holiday enum members were parsed");
    }
    return defs;
}

function parseHolidayTuple(text, key) {
    let i = 0;
    const [english, next1] = readPythonString(text, i);
    i = skipSpaces(text, next1);
    i = expectChar(text, i, ",", `Holiday.${key}`);
    i = skipSpaces(text, i);

    const [chinese, next2] = readPythonString(text, i);
    i = skipSpaces(text, next2);
    i = expectChar(text, i, ",", `Holiday.${key}`);
    i = skipSpaces(text, i);

    const m = text.slice(i).match(/^(\d+)\s*$/);
    if (!m) {
        throw new Error(`Holiday.${key}: expected integer day count, got: ${text.slice(i)}`);
    }

    return {english, chinese, days: Number(m[1])};
}

function readPythonString(text, start) {
    const quote = text[start];
    if (quote !== '"' && quote !== "'") {
        throw new Error(`Expected Python string literal near: ${text.slice(start, start + 40)}`);
    }

    let out = "";
    for (let i = start + 1; i < text.length; i++) {
        const ch = text[i];
        if (ch === quote) return [out, i + 1];

        if (ch === "\\") {
            i++;
            if (i >= text.length) throw new Error("Unterminated Python string escape");
            const esc = text[i];
            const escapes = {
                n: "\n",
                r: "\r",
                t: "\t",
                "\\": "\\",
                "'": "'",
                '"': '"',
            };
            out += Object.prototype.hasOwnProperty.call(escapes, esc) ? escapes[esc] : esc;
        } else {
            out += ch;
        }
    }

    throw new Error("Unterminated Python string literal");
}

function skipSpaces(text, i) {
    while (i < text.length && /\s/.test(text[i])) i++;
    return i;
}

function expectChar(text, i, expected, context) {
    if (text[i] !== expected) {
        throw new Error(`${context}: expected '${expected}' near: ${text.slice(i, i + 30)}`);
    }
    return i + 1;
}

function parseDateMap(source, name) {
    const startMarker = `${name} = {`;
    const start = source.indexOf(startMarker);
    if (start < 0) throw new Error(`Could not find \`${startMarker}\``);

    const bodyStart = start + startMarker.length;
    const end = source.indexOf("\n}", bodyStart);
    if (end < 0) throw new Error(`Could not find closing brace for ${name}`);

    const body = source.slice(bodyStart, end);
    const entryRe =
        /datetime\.date\(\s*year=(\d+),\s*month=(\d+),\s*day=(\d+)\s*\)\s*:\s*Holiday\.([A-Za-z_]\w*)\.value\s*,?/g;

    const entries = [];
    let match;
    while ((match = entryRe.exec(body)) !== null) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);
        const holidayKey = match[4];

        entries.push({
            date: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
            holidayKey,
        });
    }

    const sourceEntryCount = (body.match(/datetime\.date\s*\(/g) || []).length;
    if (entries.length === 0 || entries.length !== sourceEntryCount) {
        throw new Error(
            `${name}: parsed ${entries.length}/${sourceEntryCount} datetime entries; ` +
            "constants.py format may have changed"
        );
    }

    return entries;
}

function renderTypeScript({holidayDefs, holidays, workdays, inLieuDays}) {
    const lines = [];
    lines.push(
        "/* eslint-disable */",
        "// AUTO-GENERATED from constants.py by convert-constants.js.",
        "// Do not hand-edit this file; update constants.py and run the converter again.",
        "",
        'import dayjs, { type Dayjs } from "dayjs";',
        "",
        "export interface HolidayInfo {",
        "  readonly english: string;",
        "  readonly chinese: string;",
        "  readonly days: number;",
        "}",
        "",
        "/**",
        " * Map-like collection whose public keys are Dayjs objects.",
        " * Internally it indexes by YYYY-MM-DD so a newly-created equivalent Dayjs",
        " * can be used with has()/get() without object-identity problems.",
        " */",
        "export class DayjsMap<V> implements Iterable<[Dayjs, V]> {",
        "  private readonly store = new Map<string, { date: Dayjs; value: V }>();",
        "",
        "  constructor(entries?: Iterable<readonly [Dayjs, V]>) {",
        "    if (entries) {",
        "      for (const [date, value] of entries) this.set(date, value);",
        "    }",
        "  }",
        "",
        "  private key(date: Dayjs): string {",
        "    if (!dayjs.isDayjs(date) || !date.isValid()) {",
        '      throw new TypeError("expected a valid Dayjs object");',
        "    }",
        '    return date.format("YYYY-MM-DD");',
        "  }",
        "",
        "  get size(): number {",
        "    return this.store.size;",
        "  }",
        "",
        "  has(date: Dayjs): boolean {",
        "    return this.store.has(this.key(date));",
        "  }",
        "",
        "  get(date: Dayjs): V | undefined {",
        "    return this.store.get(this.key(date))?.value;",
        "  }",
        "",
        "  set(date: Dayjs, value: V): this {",
        "    const normalized = date.startOf(\"day\");",
        "    this.store.set(this.key(normalized), { date: normalized, value });",
        "    return this;",
        "  }",
        "",
        "  delete(date: Dayjs): boolean {",
        "    return this.store.delete(this.key(date));",
        "  }",
        "",
        "  clear(): void {",
        "    this.store.clear();",
        "  }",
        "",
        "  *keys(): IterableIterator<Dayjs> {",
        "    for (const item of this.store.values()) yield item.date;",
        "  }",
        "",
        "  *values(): IterableIterator<V> {",
        "    for (const item of this.store.values()) yield item.value;",
        "  }",
        "",
        "  *entries(): IterableIterator<[Dayjs, V]> {",
        "    for (const item of this.store.values()) yield [item.date, item.value];",
        "  }",
        "",
        "  [Symbol.iterator](): IterableIterator<[Dayjs, V]> {",
        "    return this.entries();",
        "  }",
        "",
        "  forEach(",
        "    callback: (value: V, date: Dayjs, map: DayjsMap<V>) => void,",
        "    thisArg?: unknown",
        "  ): void {",
        "    for (const [date, value] of this.entries()) {",
        "      callback.call(thisArg, value, date, this);",
        "    }",
        "  }",
        "}",
        "",
        "export const Holiday = {"
    );

    for (const item of holidayDefs) {
        lines.push(
            `  ${item.key}: { english: ${JSON.stringify(item.english)}, chinese: ${JSON.stringify(
                item.chinese
            )}, days: ${item.days} },`
        );
    }

    lines.push(
        "} as const satisfies Record<string, HolidayInfo>;",
        "",
        "export type HolidayKey = keyof typeof Holiday;",
        'export type HolidayName = (typeof Holiday)[HolidayKey]["english"];',
        "",
        renderMap("holidays", holidays),
        "",
        renderMap("workdays", workdays),
        "",
        renderMap("in_lieu_days", inLieuDays),
        "",
        "export const inLieuDays = in_lieu_days;",
        ""
    );

    return lines.join("\n");
}

function renderMap(name, entries) {
    const lines = [`export const ${name} = new DayjsMap<HolidayName>([`];
    for (const item of entries) {
        lines.push(`  [dayjs(${JSON.stringify(item.date)}), Holiday.${item.holidayKey}.english],`);
    }
    lines.push("]);");
    return lines.join("\n");
}

module.exports = {convertConstantsPyToTs};

if (require.main === module) {
    const inputPath = path.resolve(process.argv[2] || "constants.py");
    const outputPath = path.resolve(process.argv[3] || "constants.ts");
    const stats = convertConstantsPyToTs(inputPath, outputPath);
    console.log(
        `Converted ${inputPath} -> ${outputPath} ` +
        `(${stats.holidayTypes} holiday types, ${stats.holidays} holidays, ` +
        `${stats.workdays} workdays, ${stats.inLieuDays} in-lieu days)`
    );
}
