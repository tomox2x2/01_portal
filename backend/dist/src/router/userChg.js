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
const crypto_1 = require("crypto");
const express_1 = __importDefault(require("express"));
const connDB_1 = require("../../app/connDB");
const mysql2_1 = __importDefault(require("mysql2"));
const crypt_1 = require("../../app/crypt");
const sk_1 = require("../../app/sk");
const mailer_1 = require("../../app/mailer");
const inputLog_1 = require("../../app/inputLog");
const router = express_1.default.Router();
router.post("/Read", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userName = yield (0, sk_1.decUserName)(req.cookies.ID);
    let sqlFormatTxt = "";
    const aryInputValue = [];
    let rsltFlg = 0;
    const pramTgt = 'L0003';
    let connect;
    try {
        connect = (0, connDB_1.connectionDB)();
        // --------------------------------------------------------------------------
        sqlFormatTxt = mysql2_1.default.format("SELECT MAILADD, PASSWORD from T_USERS where USERNAME = ? ", [userName]);
        const data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
        sqlFormatTxt = mysql2_1.default.format("SELECT T1.PARAM1 as PASTCNT " +
            "from T_PARAMETER T1 " +
            "where T1.PARAMID = ? ", [pramTgt]);
        const data2 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
        // --------------------------------------------------------------------------
        res.status(200).json({ "mailAdd": data1[0].MAILADD,
            "passLen": (0, crypt_1.decrypt)(data1[0].PASSWORD, (yield (0, sk_1.getComSKEnv)())).length,
            "pastCnt": data2[0].PASTCNT });
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
router.post("/Chg", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const SK = yield (0, sk_1.getSK)(req.cookies.ID);
    const userName = yield (0, sk_1.decUserName)(req.cookies.ID);
    const pass = (0, crypt_1.decrypt)(req.body.pass, SK);
    const email = (0, crypt_1.decrypt)(req.body.email, SK);
    let sqlFormatTxt = "";
    const aryInputValue = [];
    let rsltFlg = 0;
    let connect;
    try {
        connect = (0, connDB_1.connectionDB)();
        yield (0, connDB_1.DBBeginTrans)(connect);
        // --------------------------------------------------------------------------
        // ユーザなし チェック
        sqlFormatTxt = mysql2_1.default.format("SELECT 1 from T_USERS where USERNAME = ? ", [userName]);
        let data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
        if (data1.length == 0) {
            rsltFlg = -1;
        }
        else {
            switch (req.body.mode) {
                case '1':
                    // パスワード変更
                    rsltFlg = yield chgPass(connect, userName, pass);
                    break;
                case '2':
                    // メールアドレス変更
                    rsltFlg = yield chgMail(connect, userName, email);
                    break;
                default:
                    // 全ての属性変更
                    rsltFlg = yield chgPass(connect, userName, pass);
                    if (rsltFlg == 0)
                        rsltFlg = yield chgMail(connect, userName, email);
                    break;
            }
        }
        if (rsltFlg != 0)
            yield (0, connDB_1.DBRollback)(connect);
        else
            yield (0, connDB_1.DBCommit)(connect);
        // --------------------------------------------------------------------------
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, rsltFlg === 0 ? inputLog_1.logState.SUCCESS : inputLog_1.logState.FAIL, rsltFlg === 0 ? 'UserInfo Change Done' : 'UserInfo Change Failed Flg:' + rsltFlg);
        res.send(String(rsltFlg));
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
router.post("/Reset", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const SK = yield (0, sk_1.getSK)(req.cookies.ID);
    const userName = yield (0, crypt_1.decrypt)(req.body.userName, SK);
    const email = (0, crypt_1.decrypt)(req.body.email, SK);
    let sqlFormatTxt = "";
    const aryInputValue = [];
    let rsltFlg = 0;
    let connect;
    try {
        connect = (0, connDB_1.connectionDB)();
        yield (0, connDB_1.DBBeginTrans)(connect);
        // --------------------------------------------------------------------------
        sqlFormatTxt = mysql2_1.default.format("SELECT MAILADD from T_USERS where USERNAME = ? ", [userName]);
        let data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
        // ユーザなし チェック
        if (data1.length == 0) {
            rsltFlg = 1;
            // メールアドレス チェック
        }
        else if (data1[0].MAILADD.toString() !== email) {
            rsltFlg = 2;
        }
        else {
            // 新パスワード設定
            // numDigitは 可変 ( 8～20 の間でランダム )
            const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            const numDigit = 8 + Math.floor(Math.random() * 12);
            const newPass = (0, crypto_1.randomBytes)(numDigit).reduce((p, i) => p + S[(i % S.length)], '');
            // Parameter ID:パス変更日数
            const paramID = 'L0002';
            // 仮パスワード, パスワード設定日付, リセットフラグ: 1_リセット 設定
            sqlFormatTxt = mysql2_1.default.format("update T_USERS T1 set " +
                " T1.PASSWORD = ? ," +
                " T1.PASSSETDATE = " +
                "( select adddate(sysdate(), 1 - T1.PARAM1) " +
                "  from T_PARAMETER T1 where T1.PARAMID = ? )," +
                " T1.RESETFLG = 1 " +
                "where T1.USERNAME = ? ", [(0, crypt_1.encrypt)(newPass, yield (0, sk_1.getComSKEnv)()), paramID, userName]);
            yield (0, connDB_1.updateDBSec)(connect, sqlFormatTxt, []);
            const mailID = 'X0001';
            // メール送信
            yield (0, mailer_1.sendMail)(connect, userName, mailID, [newPass]);
        }
        if (rsltFlg != 0)
            yield (0, connDB_1.DBRollback)(connect);
        else
            yield (0, connDB_1.DBCommit)(connect);
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, rsltFlg === 0 ? inputLog_1.logState.SUCCESS : inputLog_1.logState.FAIL, rsltFlg === 0 ? 'PassWord Reset Done' : 'PassWord Reset Failed Flg:' + rsltFlg);
        // --------------------------------------------------------------------------
        res.send(String(rsltFlg));
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
function chgPass(connect, userName, pass) {
    return __awaiter(this, void 0, void 0, function* () {
        let sqlFormatTxt = '';
        let rsltFlg = 0;
        const pramTgt = 'L0003';
        // 現在のパスワード チェック
        sqlFormatTxt = mysql2_1.default.format("SELECT PASSWORD from T_USERS where USERNAME = ?", [userName]);
        let data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
        const lastPass = (0, crypt_1.decrypt)(data1[0].PASSWORD, yield ((0, sk_1.getComSKEnv)()));
        // パスワードが変更前と一緒だったらアラート
        if (lastPass === pass) {
            rsltFlg = 1;
        }
        else {
            // 開錠用キー(環境変数)
            const envKey = process.env.ENC_KEY || 'TeSt';
            // 過去履歴パスワードチェック
            sqlFormatTxt = mysql2_1.default.format("SELECT T1.PASSWORD from T_PASSHIS T1 " +
                "where exists ( select 1 from T_USERS T2 where T2.USERNAME = ? " +
                "and T1.USERID = T2.USERID ) " +
                "order  by PASSSETDATE desc ", [userName]);
            data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
            // 過去に同じパスワードがあったらアラート(該当したら foreachを抜ける)
            data1.forEach((pastPass) => {
                if (pass == (0, crypt_1.decrypt)(pastPass.PASSWORD, envKey)) {
                    rsltFlg = 2;
                    return;
                }
                ;
            });
            // チェック結果：アラートなら本Fnc終了
            if (rsltFlg != 0)
                return rsltFlg;
            // システム定義に設定されているカウント数以上の履歴があるか確認、
            sqlFormatTxt = mysql2_1.default.format("SELECT T2.HISCNT + 1 - T1.PARAM1 as DELCNT " +
                "from T_PARAMETER T1, " +
                "( select count(1) as HISCNT from T_PASSHIS  T21 " +
                "where exists ( select 1 from T_USERS T22 " +
                "where T22.USERNAME = ? " +
                "and T22.USERID = T21.USERID ) ) T2 " +
                "where T1.PARAMID = ? ", [userName, pramTgt]);
            data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
            const delRowCnt = Number(data1[0].DELCNT);
            // システム定義.カウント数 <= 履歴カウント数 なら、
            // 古い履歴（HISNO が1から昇順で指定）を消去
            if (delRowCnt > 0) {
                sqlFormatTxt = mysql2_1.default.format("delete from T_PASSHIS T1 " +
                    "where exists ( select 1 from T_USERS T2 " +
                    "where T2.USERNAME = ? " +
                    "and T1.USERID = T2.USERID ) " +
                    "and T1.HISNO <= ? ", [userName, delRowCnt]);
                yield (0, connDB_1.deleteDB)(connect, sqlFormatTxt, []);
                // HISNO を消した数分だけデクリメント
                sqlFormatTxt = mysql2_1.default.format("update T_PASSHIS T1 set T1.HISNO = T1.HISNO - ? " +
                    "where exists ( select 1 from T_USERS T2 where T2.USERNAME = ? " +
                    "and T1.USERID = T2.USERID ) ", [delRowCnt, userName]);
                yield (0, connDB_1.updateDBSec)(connect, sqlFormatTxt, []);
            }
            // 前回パスワードを過去履歴に追加
            sqlFormatTxt = mysql2_1.default.format("insert into T_PASSHIS " +
                "select T1.USERID, max( coalesce(T2.HISNO, 0) ) + 1, ?, " +
                " max(T1.PASSSETDATE) " +
                "from T_USERS T1 " +
                "left outer join T_PASSHIS T2 on T1.USERID = T2.USERID " +
                "where T1.USERNAME = ? " +
                "group by T1.USERID ", [(0, crypt_1.encrypt)(lastPass, envKey), userName]);
            yield (0, connDB_1.insertDBSec)(connect, sqlFormatTxt, []);
            // 新パスワードを T_USERS に設定
            sqlFormatTxt = mysql2_1.default.format("update T_USERS T1 " +
                "set T1.PASSWORD = ? ," +
                "T1.PASSSETDATE = sysdate(), " +
                "T1.RESETFLG = 0 " +
                "where T1.USERNAME = ? ", [(0, crypt_1.encrypt)(pass, (yield ((0, sk_1.getComSKEnv)()))), userName]);
            yield (0, connDB_1.updateDBSec)(connect, sqlFormatTxt, []);
        }
        return rsltFlg;
    });
}
function chgMail(connect, userName, email) {
    return __awaiter(this, void 0, void 0, function* () {
        let sqlFormatTxt = '';
        let rsltFlg = 0;
        let aryInputValue = [];
        // メールアドレスが設定されている値と同じかどうか確認
        sqlFormatTxt = mysql2_1.default.format("SELECT 1 from T_USERS where USERNAME = ? and MAILADD = ? ", [userName, email]);
        let data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
        if (data1.length > 0)
            rsltFlg = 11;
        // 他ユーザとのメールアドレス重複 チェック
        sqlFormatTxt = mysql2_1.default.format("SELECT 1 from T_USERS where USERNAME != ? and MAILADD = ? ", [userName, email]);
        data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
        if (data1.length > 0)
            rsltFlg = 12;
        if (rsltFlg === 0) {
            sqlFormatTxt = "update T_USERS T1 set " +
                "T1.MAILADD = ? " +
                "where T1.USERNAME = ? ";
            aryInputValue.push(email);
            aryInputValue.push(userName);
            yield (0, connDB_1.updateDBSec)(connect, sqlFormatTxt, aryInputValue);
        }
        return rsltFlg;
    });
}
exports.default = router;
