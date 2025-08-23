"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const connDB_1 = require("../../app/connDB");
const mysql2_1 = __importDefault(require("mysql2"));
const sk_1 = require("../../app/sk");
const inputLog_1 = require("../../app/inputLog");
const router = express_1.default.Router();
router.post("/category", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userName = yield (0, sk_1.decUserName)(req.cookies.ID);
    const aryInputValue = [];
    let connect;
    let sqlFormatTxt;
    sqlFormatTxt = ' select ' +
        '  T1.CATEGORY ' +
        ' from V_TODOCATEGORY T1 ';
    sqlFormatTxt += listWhereSqlText('', '', '', [], '');
    sqlFormatTxt += ' order by T1.CATEGORY ';
    try {
        connect = (0, connDB_1.connectionDB)();
        // --------------------------------------------------------------------------
        sqlFormatTxt = mysql2_1.default.format(sqlFormatTxt, [userName]);
        const data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
        res.status(200).json(data1);
        // --------------------------------------------------------------------------
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occured');
    }
    finally {
        if (connect)
            (0, connDB_1.disconnectFromMySQL)(connect);
    }
}));
router.post("/list/base", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userName = yield (0, sk_1.decUserName)(req.cookies.ID);
    const aryInputValue = [];
    let connect;
    let sqlFormatTxt;
    sqlFormatTxt = ' select ' +
        '  T1.TODOID, ' +
        '  T1.ABLE, ' +
        '  T1.CATEGORY, ' +
        '  T1.PRIORITY, ' +
        '  T1.TITLE, ' +
        '  T1.DETAIL, ' +
        '  T1.ALERTDAYS ' +
        ' from T_TODOMST T1 ';
    sqlFormatTxt += listWhereSqlText(req.body.searchWord, req.body.targetCategory, req.body.id, [], '');
    sqlFormatTxt += ' order by T1.TODOID ';
    try {
        connect = (0, connDB_1.connectionDB)();
        // --------------------------------------------------------------------------
        sqlFormatTxt = mysql2_1.default.format(sqlFormatTxt, [userName]);
        const data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
        res.status(200).json(data1);
        // --------------------------------------------------------------------------
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occured');
    }
    finally {
        if (connect)
            (0, connDB_1.disconnectFromMySQL)(connect);
    }
}));
router.post("/list/detail", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userName = yield (0, sk_1.decUserName)(req.cookies.ID);
    const aryInputValue = [];
    let connect;
    let sqlFormatTxt;
    sqlFormatTxt = ' select ' +
        '  T1.TODOID, ' +
        '  t2.FREQTYPE, ' +
        '  t2.TDATE, ' +
        '  t2.TMONTH, ' +
        '  t2.TWEEK, ' +
        '  t2.TWEEKDAY, ' +
        '  t2.TDAY ' +
        ' from T_TODOMST T1 ' +
        ' left outer join T_TODOFREQ t2 ' +
        ' on  T1.USERID = t2.USERID ' +
        ' and T1.TODOID = t2.TODOID ';
    sqlFormatTxt += listWhereSqlText(req.body.searchWord, req.body.targetCategory, req.body.id, [], '');
    sqlFormatTxt += ' order by T1.TODOID, t2.TDATE, t2.TMONTH, t2.TWEEK, t2.TWEEKDAY, t2.TDAY';
    try {
        connect = (0, connDB_1.connectionDB)();
        // --------------------------------------------------------------------------
        sqlFormatTxt = mysql2_1.default.format(sqlFormatTxt, [userName]);
        const data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
        res.status(200).json(data1);
        // --------------------------------------------------------------------------
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occured');
    }
    finally {
        if (connect)
            (0, connDB_1.disconnectFromMySQL)(connect);
    }
}));
router.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userName = yield (0, sk_1.decUserName)(req.cookies.ID);
    const aryInputValue = [];
    let connect;
    let sqlFormatTxt;
    try {
        connect = (0, connDB_1.connectionDB)();
        yield (0, connDB_1.DBBeginTrans)(connect);
        sqlFormatTxt = mysql2_1.default.format("select USERID from T_USERS where USERNAME = ? ", [userName]);
        const data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
        sqlFormatTxt = mysql2_1.default.format(" select coalesce( max(TODOID), 0 ) + 1 as TODOID_C " +
            " from T_TODOMST where USERID = ? ", [data1[0].USERID]);
        const data2 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
        yield mstInsert(connect, data1[0].USERID, data2[0].TODOID_C, req.body.category, req.body.priority, req.body.title, req.body.text, req.body.tAlertDay, req.body.able);
        yield detailInsert(connect, data1[0].USERID, data2[0].TODOID_C, req.body.tCycles, req.body.tDate, req.body.tMonth, req.body.tWeek, req.body.tWeekDay, req.body.tDay);
        yield (0, connDB_1.DBCommit)(connect);
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.SUCCESS_VISIBLE, 'Todo Create : ' + data2[0].TODOID_C);
        res.status(200).send();
    }
    catch (error) {
        if (connect)
            yield (0, connDB_1.DBRollback)(connect);
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.FAIL, String(error));
        console.error('Error:', error);
        res.status(500).send('An error occured');
    }
    finally {
        if (connect)
            (0, connDB_1.disconnectFromMySQL)(connect);
    }
}));
router.post("/update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userName = yield (0, sk_1.decUserName)(req.cookies.ID);
    const aryInputValue = [];
    let connect;
    let sqlFormatTxt;
    try {
        connect = (0, connDB_1.connectionDB)();
        yield (0, connDB_1.DBBeginTrans)(connect);
        sqlFormatTxt = mysql2_1.default.format("select USERID from T_USERS where USERNAME = ? ", [userName]);
        const data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
        yield mstDelete(connect, data1[0].USERID, req.body.id);
        yield mstInsert(connect, data1[0].USERID, req.body.id, req.body.category, req.body.priority, req.body.title, req.body.text, req.body.tAlertDay, req.body.able);
        yield detailDelete(connect, data1[0].USERID, req.body.id);
        yield detailInsert(connect, data1[0].USERID, req.body.id, req.body.tCycles, req.body.tDate, req.body.tMonth, req.body.tWeek, req.body.tWeekDay, req.body.tDay);
        yield (0, connDB_1.DBCommit)(connect);
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.SUCCESS_VISIBLE, 'Todo Update : ' + req.body.id);
        res.status(200).send();
    }
    catch (error) {
        if (connect)
            yield (0, connDB_1.DBRollback)(connect);
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.FAIL, String(error));
        console.error('Error:', error);
        res.status(500).send('An error occured');
    }
    finally {
        if (connect)
            (0, connDB_1.disconnectFromMySQL)(connect);
    }
}));
router.post("/delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userName = yield (0, sk_1.decUserName)(req.cookies.ID);
    const aryInputValue = [];
    let connect;
    let sqlFormatTxt;
    try {
        connect = (0, connDB_1.connectionDB)();
        yield (0, connDB_1.DBBeginTrans)(connect);
        sqlFormatTxt = mysql2_1.default.format("select USERID from T_USERS where USERNAME = ? ", [userName]);
        const data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
        yield mstDelete(connect, data1[0].USERID, req.body.id);
        yield detailDelete(connect, data1[0].USERID, req.body.id);
        yield (0, connDB_1.DBCommit)(connect);
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.SUCCESS_VISIBLE, 'Todo Delete : ' + req.body.id);
        res.status(200).send();
    }
    catch (error) {
        if (connect)
            yield (0, connDB_1.DBRollback)(connect);
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.FAIL, String(error));
        console.error('Error:', error);
        res.status(500).send('An error occured');
    }
    finally {
        if (connect)
            (0, connDB_1.disconnectFromMySQL)(connect);
    }
}));
router.post("/list/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userName = yield (0, sk_1.decUserName)(req.cookies.ID);
    const aryInputValue = [];
    let connect;
    let sqlFormatTxt;
    let strUserId;
    let strStartDate;
    let strEndDate;
    try {
        connect = (0, connDB_1.connectionDB)();
        sqlFormatTxt = mysql2_1.default.format("select USERID from T_USERS where USERNAME = ? ", [userName]);
        let data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
        strUserId = data1[0].USERID;
        sqlFormatTxt = mysql2_1.default.format("select PARAM1 as STARTMONTH, " +
            " PARAM2 as ENDMONTH " +
            " from T_PARAMETER where PARAMID = ? ", ['D0001']);
        data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
        sqlFormatTxt = mysql2_1.default.format(` select date_format(adddate( targetDate, interval ${data1[0].STARTMONTH} month ), '%Y-%m-%d') as startDate, ` +
            `        date_format(last_day (adddate( targetDate, interval ${data1[0].ENDMONTH} month ) ), '%Y-%m-%d') as endDate ` +
            ` from ( select str_to_date( ?,'%Y-%m-%d') as targetDate from dual ) w1`, [req.body.createDate]);
        data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
        strStartDate = data1[0].startDate;
        strEndDate = data1[0].endDate;
        yield (0, connDB_1.DBBeginTrans)(connect);
        yield createWorkCalender(connect, strStartDate, strEndDate);
        sqlFormatTxt =
            " delete from T_TODOLIST T1 where T1.USERID = ? and T1.TDATE >= ? and T1.DONE = false ";
        yield (0, connDB_1.deleteDB)(connect, sqlFormatTxt, [strUserId, strStartDate]);
        sqlFormatTxt =
            ` insert into T_TODOLIST ` +
                ` select distinct ` +
                `    T1.USERID, T1.TODOID, T1.CATEGORY, T1.PRIORITY, ` +
                `    T1.TITLE, T1.DETAIL, W1.TDATE, ` +
                `    ADDDATE(W1.TDATE, T1.ALERTDAYS * -1 ) as ALEARDATE, ` +
                `    false as DONE ` +
                `  from T_TODOMST T1, T_TODOFREQ T2, W_CALENDER W1 ` +
                `  where T1.USERID = T2.USERID ` +
                `  and   T1.TODOID = T2.TODOID ` +
                `  and   T1.USERID = ? ` +
                `  and   T1.ABLE =  1 ` +
                `  and   case T2.FREQTYPE ` +
                `      when 1 then ( W1.TDATE = T2.TDATE ) ` +
                `      when 2 then ( W1.TWEEKDAY = T2.TWEEKDAY ) ` +
                `      when 3 then ( W1.TMONTH = T2.TMONTH and W1.TDAY = T2.TDAY ) ` +
                `      when 4 then ( W1.TMONTH = T2.TMONTH and W1.TWEEK = T2.TWEEK and W1.TWEEKDAY = T2.TWEEKDAY ) ` +
                `      else ( 1 = 0 ) ` +
                `      end ` +
                `  and   not exists ( ` +
                `    select 1 from T_TODOLIST T3 ` +
                `    where T3.USERID = T1.USERID ` +
                `    and   T3.TODOID = T1.TODOID ` +
                `    and   T3.TDATE  = W1.TDATE ` +
                `    and   T3.DONE = true ` +
                `    ) `;
        yield (0, connDB_1.insertDB)(connect, sqlFormatTxt, [strUserId]);
        yield (0, connDB_1.DBCommit)(connect);
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.SUCCESS_VISIBLE, 'Todo List Create : ' + strStartDate + ' - ' + strEndDate);
        res.status(200).send();
    }
    catch (error) {
        if (connect)
            yield (0, connDB_1.DBRollback)(connect);
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.FAIL, String(error));
        console.error('Error:', error);
        res.status(500).send('An error occured');
    }
    finally {
        if (connect)
            (0, connDB_1.disconnectFromMySQL)(connect);
    }
}));
function dateString(date) {
    return date.getFullYear().toString() + '-' +
        ('0' + (date.getMonth() + 1).toString()).slice(-2) + '-' +
        ('0' + date.getDate().toString()).slice(-2);
}
function listWhereSqlText(searceWord, targetCategory, targetID, targetPriority, targetDate) {
    let partSqlTxt = ' where exists ( ' +
        '  select 1 from T_USERS T3 ' +
        '  where T1.USERID = T3.USERID ' +
        '  and   T3.USERNAME = ? ) ';
    if (searceWord) {
        const searchWordParam = `%${searceWord}%`;
        partSqlTxt += mysql2_1.default.format(' and ( T1.TITLE like ? or T1.DETAIL like ? ) ', [searchWordParam, searchWordParam]);
    }
    if (targetCategory) {
        partSqlTxt += mysql2_1.default.format(' and T1.CATEGORY = ? ', [targetCategory]);
    }
    if (targetID) {
        partSqlTxt += mysql2_1.default.format(' and T1.TODOID = ? ', [targetID]);
    }
    if (targetPriority.length != 0) {
        partSqlTxt += mysql2_1.default.format(' and T1.PRIORITY in (?) ', [targetPriority]);
    }
    if (targetDate) {
        partSqlTxt += mysql2_1.default.format(' and T1.TDATE = ? ', [targetDate]);
    }
    return partSqlTxt;
}
;
const mstDelete = (connect, userId, todoId) => __awaiter(void 0, void 0, void 0, function* () {
    const aryInputValue = [];
    const sqlFormatTxt = "delete from T_TODOMST where USERID = ? and TODOID = ? ";
    aryInputValue.push(userId);
    aryInputValue.push(todoId);
    yield (0, connDB_1.deleteDB)(connect, sqlFormatTxt, aryInputValue);
});
const mstInsert = (connect, userId, todoId, strCategory, strProperty, strTitle, strText, strAlertDay, strAble) => __awaiter(void 0, void 0, void 0, function* () {
    const aryInputValue = [];
    const sqlFormatTxt = "insert into T_TODOMST values ( ?, ?, ?, ?, ?, ?, ?, ? ) ";
    aryInputValue.push(userId);
    aryInputValue.push(todoId);
    aryInputValue.push(strCategory);
    aryInputValue.push(strProperty);
    aryInputValue.push(strTitle);
    aryInputValue.push(strText);
    aryInputValue.push(strAlertDay);
    aryInputValue.push(strAble);
    yield (0, connDB_1.insertDB)(connect, sqlFormatTxt, aryInputValue);
});
const detailDelete = (connect, userId, todoId) => __awaiter(void 0, void 0, void 0, function* () {
    const aryInputValue = [];
    const sqlFormatTxt = "delete from T_TODOFREQ where USERID = ? and TODOID = ? ";
    aryInputValue.push(userId);
    aryInputValue.push(todoId);
    yield (0, connDB_1.deleteDB)(connect, sqlFormatTxt, aryInputValue);
});
const detailInsert = (connect, userId, todoId, strCycles, strDate, strMonthAry, strWeekAry, strWeekDayAry, strDayAry) => __awaiter(void 0, void 0, void 0, function* () {
    const aryInputValue = [];
    let sqlFormatTxt;
    switch (strCycles) {
        case '1':
            sqlFormatTxt = "insert into T_TODOFREQ values ( ?, ?, ?, ?, null, null, null, null ) ";
            aryInputValue.push(userId);
            aryInputValue.push(todoId);
            aryInputValue.push(strCycles);
            aryInputValue.push(strDate);
            yield (0, connDB_1.insertDB)(connect, sqlFormatTxt, aryInputValue);
            aryInputValue.splice(0);
            break;
        case '2':
            sqlFormatTxt = "insert into T_TODOFREQ values ( ?, ?, ?, null, null, null, ?, null ) ";
            for (const e of strWeekDayAry) {
                aryInputValue.push(userId);
                aryInputValue.push(todoId);
                aryInputValue.push(strCycles);
                aryInputValue.push(e.value);
                yield (0, connDB_1.insertDB)(connect, sqlFormatTxt, aryInputValue);
                aryInputValue.splice(0);
            }
            ;
            break;
        case '3':
            sqlFormatTxt = "insert into T_TODOFREQ values ( ?, ?, ?, null, ?, null, null, ? ) ";
            for (const e1 of strMonthAry) {
                for (const e2 of strDayAry) {
                    aryInputValue.push(userId);
                    aryInputValue.push(todoId);
                    aryInputValue.push(strCycles);
                    aryInputValue.push(e1.value);
                    aryInputValue.push(e2.value);
                    yield (0, connDB_1.insertDB)(connect, sqlFormatTxt, aryInputValue);
                    aryInputValue.splice(0);
                }
                ;
            }
            ;
            break;
        case '4':
            sqlFormatTxt = "insert into T_TODOFREQ values ( ?, ?, ?, null, ?, ?, ?, null ) ";
            for (const e1 of strMonthAry) {
                for (const e2 of strWeekAry) {
                    for (const e3 of strWeekDayAry) {
                        aryInputValue.push(userId);
                        aryInputValue.push(todoId);
                        aryInputValue.push(strCycles);
                        aryInputValue.push(e1.value);
                        aryInputValue.push(e2.value);
                        aryInputValue.push(e3.value);
                        yield (0, connDB_1.insertDB)(connect, sqlFormatTxt, aryInputValue);
                        aryInputValue.splice(0);
                    }
                    ;
                }
                ;
            }
            ;
            break;
        default:
            throw new Error('System Error : tCycles Setting');
    }
});
const createWorkCalender = (connect, strStartDate, strEndDate) => __awaiter(void 0, void 0, void 0, function* () {
    let sqlFormatTxt;
    // temp table 作成
    yield (0, connDB_1.createTempTable)(connect, 'W_CALENDER', 'T_CALENDER');
    const startDate = new Date(strStartDate);
    const endDate = new Date(strEndDate);
    const dayCnt = Math.floor((endDate.getTime() - startDate.getTime()) / (60 * 60 * 24 * 1000));
    let targetDate;
    let targetMonth;
    let targetWeek;
    let targetWeekday;
    let targetDay;
    let targetMonthStartDate;
    let targetMonthLastDate;
    let parWeekMakeCnt;
    let startDay;
    let monthCnt = Math.floor(((endDate.getFullYear() * 12 + endDate.getMonth())
        - (startDate.getFullYear() * 12 + startDate.getMonth())));
    targetMonthStartDate = new Date(startDate.getFullYear(), startDate.getMonth(), 2);
    // insert クエリ 作成
    sqlFormatTxt = ' insert into W_CALENDER with targetCarender as ( ';
    for (let i = 0; i <= monthCnt; i++) {
        if (i == 0)
            startDay = startDate.getDate();
        else
            startDay = 1;
        targetMonthLastDate = new Date(targetMonthStartDate.getFullYear(), targetMonthStartDate.getMonth() + 1, 0);
        for (let d = startDay; d <= 31; d++) {
            targetDate = new Date(targetMonthStartDate.getFullYear(), targetMonthStartDate.getMonth(), d);
            targetDay = d;
            targetWeek = Math.floor((targetDay - 1) / 7) + 1;
            targetWeekday = targetDate.getDay();
            if (targetDate.getMonth() == targetMonthStartDate.getMonth()) {
                targetMonth = targetDate.getMonth() + 1;
                sqlFormatTxt += `select '${dateString(targetDate)}' as T1, ` +
                    `${targetMonth} as T2, ` +
                    `${targetWeek} as T3, ` +
                    `${targetWeekday} as T4, ` +
                    `${targetDay} as T5  from dual union `;
            }
            else {
                targetDate = targetMonthLastDate;
                targetMonth = targetDate.getMonth() + 1;
                sqlFormatTxt += `select '${dateString(targetDate)}' as T1, ` +
                    `${targetMonth} as T2,  ` +
                    `null as T3,  ` +
                    `null as T4, ` +
                    `${targetDay} as T5  from dual union `;
            }
        }
        targetDate = targetMonthLastDate;
        targetDay = targetDate.getDate();
        parWeekMakeCnt = 35 - targetDay;
        targetDate = new Date(targetMonthStartDate.getFullYear(), targetMonthStartDate.getMonth() + 1, -6);
        for (let d2 = 1; d2 <= parWeekMakeCnt; d2++) {
            targetMonth = targetDate.getMonth() + 1;
            targetDay = targetDate.getDate();
            targetWeek = Math.floor((targetDay - 1) / 7) + 2;
            targetWeekday = targetDate.getDay();
            sqlFormatTxt += `select '${dateString(targetDate)}' as T1, ` +
                `${targetMonth} as T2, ` +
                `${targetWeek} as T3, ` +
                `${targetWeekday} as T4, ` +
                `null as T5 from dual union `;
            targetDate.setDate(targetDate.getDate() + 1);
        }
        targetMonthStartDate.setMonth(targetMonthStartDate.getMonth() + 1);
    }
    sqlFormatTxt = sqlFormatTxt.substring(1, sqlFormatTxt.length - 6) + ')';
    sqlFormatTxt += ' select * from targetCarender ';
    yield (0, connDB_1.insertDB)(connect, sqlFormatTxt, []);
});
router.post("/list/Item", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userName = yield (0, sk_1.decUserName)(req.cookies.ID);
    const aryInputValue = [];
    let connect;
    let sqlFormatTxt;
    sqlFormatTxt = ' select ' +
        '  T1.TODOID, ' +
        '  T1.CATEGORY, ' +
        '  T1.PRIORITY, ' +
        '  T1.TITLE, ' +
        '  T1.DETAIL, ' +
        '  T1.TDATE, ' +
        '  T1.ALERTDATE, ' +
        '  T1.DONE ' +
        ' from T_TODOLIST T1 ';
    sqlFormatTxt += listWhereSqlText("", "", "", req.body.targetPriority, req.body.targetDate);
    sqlFormatTxt += ' order by T1.PRIORITY, T1.CATEGORY, T1.TDATE, T1.TODOID';
    try {
        connect = (0, connDB_1.connectionDB)();
        // --------------------------------------------------------------------------
        sqlFormatTxt = mysql2_1.default.format(sqlFormatTxt, [userName]);
        const data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
        res.status(200).json(data1);
        // --------------------------------------------------------------------------
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occured');
    }
    finally {
        if (connect)
            (0, connDB_1.disconnectFromMySQL)(connect);
    }
}));
exports.default = router;
