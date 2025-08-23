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
const common_1 = require("../../app/common");
const router = express_1.default.Router();
router.post("/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userName = yield (0, sk_1.decUserName)(req.cookies.ID);
    let connect;
    const timeformStr1 = yield (0, common_1.getDateFormatSQL)(12); // 年月日時分
    const timeformStr2 = yield (0, common_1.getDateFormatSQL)(4); // 年月
    let sqlTxt = 'select ' +
        ' DIARYID, TITLE, TEXT, ' +
        ' date_format(CREATEDATE, ' + timeformStr1 + ' ) as CREATEDATE, ' +
        ' date_format(UPDATEDATE, ' + timeformStr1 + ' ) as UPDATEDATE ' +
        ' from T_DIARY T1 ' +
        ' where exists ( ' +
        '  select 1 from T_USERS T2 ' +
        '  where T1.USERID = T2.USERID ' +
        '  and   T2.USERNAME = ? ) ';
    if (req.body.searchWord) {
        const searchWordParam = `%${req.body.searchWord}%`;
        sqlTxt += mysql2_1.default.format(' and ( TITLE like ? or TEXT like ? ) ', [searchWordParam, searchWordParam]);
    }
    else if (req.body.targetMonth) {
        sqlTxt += mysql2_1.default.format(' and date_format(CREATEDATE, ' + timeformStr2 + ' ) = ?', [req.body.targetMonth]);
    }
    else if (req.body.id) {
        sqlTxt += mysql2_1.default.format(' and DIARYID = ? ', [req.body.id]);
    }
    sqlTxt += ' order by 4 desc, DIARYID desc ';
    try {
        connect = (0, connDB_1.connectionDB)();
        // --------------------------------------------------------------------------
        let sqlFormatTxt = mysql2_1.default.format(sqlTxt, [userName]);
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
router.post("/index", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userName = yield (0, sk_1.decUserName)(req.cookies.ID);
    let connect;
    try {
        connect = (0, connDB_1.connectionDB)();
        // --------------------------------------------------------------------------
        let sqlFormatTxt = mysql2_1.default.format('select ' +
            ' CREATEMONTH ' +
            ' from V_DIARYMONTH T1 ' +
            ' where exists ( ' +
            '  select 1 from T_USERS T2 ' +
            '  where T1.USERID = T2.USERID ' +
            '  and   T2.USERNAME = ? ) ' +
            ' order by CREATEMONTH desc ', [userName]);
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
    try {
        connect = (0, connDB_1.connectionDB)();
        let sqlFormatTxt = 'insert into T_DIARY ' +
            ' select ' +
            '  T1.USERID, max(coalesce( T2.DIARYID, 0 )) + 1, ?, ?, sysdate(), sysdate() ' +
            ' from ( select USERID from T_USERS ' +
            '        where USERNAME = ? ) T1 ' +
            ' left outer join T_DIARY T2 on T1.USERID = T2.USERID ' +
            ' group by T1.USERID ';
        aryInputValue.push(req.body.title);
        aryInputValue.push(req.body.text);
        aryInputValue.push(userName);
        yield (0, connDB_1.insertDB)(connect, sqlFormatTxt, aryInputValue);
        (0, connDB_1.DBCommit)(connect);
        const data1 = yield (0, connDB_1.selectDB)(connect, mysql2_1.default.format('select coalesce( max(T1.DIARYID), 0 ) as DIARYID from T_DIARY T1' +
            ' inner join ( select USERID from T_USERS ' +
            '               where USERNAME = ? ) T2 on T1.USERID = T2.USERID ', [userName]));
        if (data1[0].DIARYID.toString() !== '0') {
            (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.SUCCESS_VISIBLE, 'Diary Create : ' + data1[0].DIARYID + ' : ' + req.body.title);
        }
        else {
            (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.FAIL, 'Diary Create FAIL ');
        }
        res.status(200).send();
    }
    catch (error) {
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
    try {
        connect = (0, connDB_1.connectionDB)();
        let sqlFormatTxt = ' update T_DIARY T1 set ' +
            ' TITLE = ? ,' +
            ' TEXT = ? ,' +
            ' UPDATEDATE = sysdate()' +
            ' where exists ( ' +
            '      select 1 from T_USERS T2 ' +
            '      where T1.USERID = T2.USERID and T2.USERNAME = ? )  ' +
            ' and DIARYID = ?';
        aryInputValue.push(req.body.title);
        aryInputValue.push(req.body.text);
        aryInputValue.push(userName);
        aryInputValue.push(req.body.diaryId);
        yield (0, connDB_1.updateDB)(connect, sqlFormatTxt, aryInputValue);
        (0, connDB_1.DBCommit)(connect);
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.SUCCESS_VISIBLE, 'Diary Update : ' + req.body.diaryId + ' : ' + req.body.title);
        res.status(200).send();
    }
    catch (error) {
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
    try {
        connect = (0, connDB_1.connectionDB)();
        let sqlFormatTxt = ' delete from T_DIARY T1 ' +
            ' where exists ( ' +
            '      select 1 from T_USERS T2 ' +
            '      where T1.USERID = T2.USERID and T2.USERNAME = ? )  ' +
            ' and DIARYID = ?';
        aryInputValue.push(userName);
        aryInputValue.push(req.body.diaryId);
        yield (0, connDB_1.deleteDB)(connect, sqlFormatTxt, aryInputValue);
        (0, connDB_1.DBCommit)(connect);
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.SUCCESS_VISIBLE, 'Diary Delete :' + req.body.diaryId + ' : ' + req.body.title);
        res.status(200).send();
    }
    catch (error) {
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.FAIL, String(error));
        console.error('Error:', error);
        res.status(500).send('An error occured');
    }
    finally {
        if (connect)
            (0, connDB_1.disconnectFromMySQL)(connect);
    }
}));
exports.default = router;
