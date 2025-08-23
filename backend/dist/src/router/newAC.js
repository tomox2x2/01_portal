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
const sk_1 = require("../../app/sk");
const inputLog_1 = require("../../app/inputLog");
const router = express_1.default.Router();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const SK = yield (0, sk_1.getSK)(req.cookies.ID);
    const userName = (0, crypt_1.decrypt)(req.body.userName, SK);
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
        sqlFormatTxt = mysql2_1.default.format("SELECT * from T_USERS where USERNAME = ? ", [userName]);
        const data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
        sqlFormatTxt = mysql2_1.default.format("SELECT * from T_USERS where MAILADD = ? ", [email]);
        const data2 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
        if (data1.length > 0) {
            rsltFlg += 1; // ユーザ重複
        }
        if (data2.length > 0) {
            rsltFlg += 2; // メールアドレス重複
        }
        if (rsltFlg === 0) {
            sqlFormatTxt = "INSERT INTO T_USERS VALUES ( null, ?, ?, ?, 0, sysdate(), sysdate(), 0 ) ";
            aryInputValue.push(userName);
            aryInputValue.push((0, crypt_1.encrypt)(pass, (yield (0, sk_1.getComSKEnv)())));
            aryInputValue.push(email);
            yield (0, connDB_1.insertDB)(connect, sqlFormatTxt, aryInputValue);
            yield (0, connDB_1.DBCommit)(connect);
        }
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, rsltFlg === 0 ? inputLog_1.logState.SUCCESS : inputLog_1.logState.FAIL, rsltFlg === 0 ? 'New Account Make Success' :
            'New Account don`t Make Flg:' + rsltFlg);
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
exports.default = router;
