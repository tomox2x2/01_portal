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
const crypt_1 = require("../../app/crypt");
const jwtHelper_1 = require("../helper/jwtHelper");
const sk_1 = require("../../app/sk");
const inputLog_1 = require("../../app/inputLog");
const router = express_1.default.Router();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const SK = yield (0, sk_1.getSK)(req.cookies.ID);
    const tarID = yield (0, crypt_1.decrypt)(req.cookies.ID, (yield (0, sk_1.getComSKEnv)()));
    const userName = (0, crypt_1.decrypt)(req.body.userName, SK);
    const pass = (0, crypt_1.decrypt)(req.body.pass, SK);
    const aryInputValue = [];
    let connect;
    try {
        connect = (0, connDB_1.connectionDB)();
        yield (0, connDB_1.DBBeginTrans)(connect);
        // --------------------------------------------------------------------------
        let sqlFormatTxt = mysql2_1.default.format("select * from T_USERS where USERNAME = ? ", [userName]);
        let data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
        let returnCd = '0';
        if (data1.length === 0) {
            returnCd = '1'; // 対象ユーザなし
        }
        else if ((0, crypt_1.decrypt)(data1[0].PASSWORD, (yield (0, sk_1.getComSKEnv)())) !== pass) {
            const failCheckID = 'L0001';
            // ログイン失敗回数 インクリメント
            sqlFormatTxt = mysql2_1.default.format("update T_USERS set LGINFAIL = LGINFAIL + 1 where USERNAME = ? ", [userName]);
            yield (0, connDB_1.updateDBSec)(connect, sqlFormatTxt, aryInputValue);
            yield (0, connDB_1.DBCommit)(connect);
            sqlFormatTxt = mysql2_1.default.format("select T1.LGINFAIL from T_USERS T1 " +
                "where T1.USERNAME = ? " +
                "and T1.LGINFAIL >= " +
                " ( select T2.PARAM1 from T_PARAMETER T2 where PARAMID = ? ) ", [userName, failCheckID]);
            data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
            if (data1.length === 0)
                returnCd = '2'; // パスワード不正
            else
                returnCd = '3'; // パスワード不正 かつ 回数超過
        }
        else {
            const passChgID = 'L0002';
            //ログイン変更期限チェック
            sqlFormatTxt = mysql2_1.default.format("select 1 from T_USERS T1 " +
                "where T1.USERNAME = ? " +
                "and  DATEDIFF( sysdate(), T1.LGINFAIL) > " +
                " ( select T2.PARAM1 from T_PARAMETER T2 where PARAMID = ? ) ", [userName, passChgID]);
            data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
            if (data1.length !== 0) {
                returnCd = '4'; // 変更期限超過判定
            }
            //仮パスワードでのログイン（リセットフラグ）
            sqlFormatTxt = mysql2_1.default.format("select 1 from T_USERS T1 " +
                "where T1.USERNAME = ? " +
                "and   T1.RESETFLG = 1 ", [userName, passChgID]);
            data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
            if (data1.length !== 0) {
                returnCd = '5'; // パスワードリセット
            }
            // ログイン失敗回数 クリア / ログイン時間更新
            sqlFormatTxt = mysql2_1.default.format("update T_USERS set LGINFAIL = 0, LGINTIME = sysdate() where USERNAME = ? ", [userName]);
            yield (0, connDB_1.updateDBSec)(connect, sqlFormatTxt, aryInputValue);
            // T_SKEY.USERNAME_E に ユーザ名(暗号化)を設定
            sqlFormatTxt = mysql2_1.default.format("update T_SKEYS set USERNAME_E = ? where ID = ? ", [req.body.userName, tarID]);
            yield (0, connDB_1.updateDBSec)(connect, sqlFormatTxt, aryInputValue);
            // jwtToken トークンを生成
            res.cookie("jwtToken", jwtHelper_1.jwtHelper.createToken(), {
                httpOnly: true,
                expires: jwtHelper_1.jwtHelper.setTokenDate(),
                path: '/',
            });
            yield (0, connDB_1.DBCommit)(connect);
        }
        switch (returnCd) {
            case '0':
                (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.SUCCESS, 'LOGIN SUCCESS');
                break;
            case '3':
                (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.FAIL, 'LOCKOUT');
                break;
            default:
                break;
        }
        res.send(returnCd);
        // --------------------------------------------------------------------------
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
exports.default = router;
