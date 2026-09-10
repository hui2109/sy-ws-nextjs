import Database from "better-sqlite3";

export const sqlite = new Database("/Users/kukudehui/Documents/exec_code/HTML/sy-ws-nextjs/src/prisma/sqlite/WorkSchedule.db", {
    readonly: true,
});