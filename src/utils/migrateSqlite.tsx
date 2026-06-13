import {sqlite} from "@/routers/sqlite";


const personnel = sqlite
    .prepare("SELECT * FROM personnel JOIN account ON personnel.account_id = account.id")
    .all()
;

console.log(personnel);