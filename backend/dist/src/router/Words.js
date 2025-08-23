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
const router = express_1.default.Router();
router.post("/Set", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userName = yield (0, sk_1.decUserName)(req.cookies.ID);
    let sqlFormatTxt = "";
    const aryInputValue = [];
    let intDataCnt = 0;
    let targetDataId = "";
    let connect;
    try {
        connect = (0, connDB_1.connectionDB)();
        (0, connDB_1.DBBeginTrans)(connect);
        // セット済みかどうか確認
        sqlFormatTxt = mysql2_1.default.format("select count (*) as cnt from T_WORDPARDAY T1" +
            " where exists ( select 1 from T_USERS T2 where T2.USERID = T1.USERID and T2.USERNAME = ? )" +
            " and CAST(SETDATE as date) = CAST(sysdate() as date )", [userName]);
        const data0 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
        // セットされているWordがない場合、セット実行
        if (Number(data0[0].cnt) == 0) {
            sqlFormatTxt = mysql2_1.default.format("select count(*) as cnt from T_MSTWORD");
            const data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
            if (typeof data1[0].cnt === 'number') {
                // T_MSTWORD の ID を設定
                intDataCnt = Number(data1[0].cnt);
                targetDataId = String(Math.round(Math.random() * intDataCnt));
                // ID が「0」と設定された場合は「1」に設定
                if (targetDataId == '0')
                    targetDataId = '1';
                sqlFormatTxt = mysql2_1.default.format("select count(*) as cnt " +
                    " from T_WORDPARDAY T1 " +
                    " where exists ( select 1 from T_USERS T2 where T2.USERID = T1.USERID and T2.USERNAME = ? )", [userName]);
                const data2 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
                // 対象ユーザの T_WORDPARDAY データがあれば上書きする。
                if (Number(data2[0].cnt) > 0) {
                    sqlFormatTxt = "update T_WORDPARDAY T1 set WORDID = ? , SETDATE = sysdate() " +
                        " where exists ( select 1 from T_USERS T2 where T2.USERID = T1.USERID and T2.USERNAME = ? )";
                    aryInputValue.push(targetDataId);
                    aryInputValue.push(userName);
                    yield (0, connDB_1.updateDB)(connect, sqlFormatTxt, aryInputValue);
                    yield (0, connDB_1.DBCommit)(connect);
                    res.send("0");
                    // 対象ユーザの T_WORDPARDAY データがなければ新たに登録する。
                }
                else {
                    sqlFormatTxt = "insert into T_WORDPARDAY select USERID, ?, sysdate() from T_USERS where USERNAME = ? ";
                    aryInputValue.push(targetDataId);
                    aryInputValue.push(userName);
                    yield (0, connDB_1.insertDB)(connect, sqlFormatTxt, aryInputValue);
                    yield (0, connDB_1.DBCommit)(connect);
                    res.send("0");
                }
            }
            else {
                res.send('1');
            }
        }
        else {
            res.send('0');
        }
    }
    catch (error) {
        if (connect)
            yield (0, connDB_1.DBRollback)(connect);
        console.error('Error:', error);
        res.status(500).send('An error occured');
    }
    finally {
        if (connect)
            (0, connDB_1.disconnectFromMySQL)(connect);
    }
}));
router.post("/Read", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userName = yield (0, sk_1.decUserName)(req.cookies.ID);
    let sqlFormatTxt = "";
    const aryInputValue = [];
    let connect;
    try {
        connect = (0, connDB_1.connectionDB)();
        sqlFormatTxt = mysql2_1.default.format("select T1.WORD, T1.WRITEN from " +
            "(select row_number() over( order by WORDID ) as rowNo, WORD, WRITEN from T_MSTWORD ) T1 " +
            " left join T_WORDPARDAY T2  on T1.rowNo = T2.WORDID " +
            " where exists ( select 1 from T_USERS T3 where T3.USERID = T2.USERID and T3.USERNAME = ? ) ", [userName]);
        const data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
        res.send(data1);
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
