"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypt_1 = require("./crypt");
const connDB_1 = require("./connDB");
const mysql = __importStar(require("mysql2"));
const util = __importStar(require("node:util"));
const sk_1 = require("./sk");
const { positionals } = util.parseArgs({
    allowPositionals: true
});
function settingMail(arySetting) {
    return __awaiter(this, void 0, void 0, function* () {
        let sqlFormatTxt = '';
        let rtnFlg = '0';
        const paramID = 'M0001';
        const paramName = 'MailTransSetting';
        const paramDescnt = 'メール送信設定 1:SMTPサーバ,2:ポート番号,3:Secure設定,4:送信元メルアド,5:送信元メルアドパス';
        const connect = (0, connDB_1.connectionDB)();
        try {
            if (arySetting.length !== 5)
                return rtnFlg = '1';
            const strSMTPServer = arySetting[0]; // SMTPServer
            const strPortNo = arySetting[1]; // PortNo
            const strSecure = arySetting[2]; // SecureSetting
            const strMailAdd = arySetting[3]; // User ( MailAddress )
            const strDecPass = arySetting[4]; // Password
            if (strSecure !== "true" && strSecure !== "false")
                return rtnFlg = '2';
            yield (0, connDB_1.DBBeginTrans)(connect);
            // T_PARAMETER から 該当IDデータ削除
            sqlFormatTxt = " delete from T_PARAMETER T1 where T1.PARAMID = ? ";
            yield (0, connDB_1.deleteDB)(connect, sqlFormatTxt, [paramID]);
            const strEncPass = (0, crypt_1.encrypt)(strDecPass, yield (0, sk_1.getComSKEnv)());
            // データ設定
            sqlFormatTxt = mysql.format("insert into T_PARAMETER values (?, ?, ?, ?, ?, ?, ?, ? ) ", [paramID, paramName, strSMTPServer, strPortNo, strSecure, strMailAdd, strEncPass, paramDescnt]);
            yield (0, connDB_1.insertDBSec)(connect, sqlFormatTxt, []);
            yield (0, connDB_1.DBCommit)(connect);
            return rtnFlg = '0';
        }
        catch (error) {
            if (connect)
                yield (0, connDB_1.DBRollback)(connect);
            console.error('Error:', error);
            return '-1';
        }
        finally {
            if (connect)
                (0, connDB_1.disconnectFromMySQL)(connect);
            return rtnFlg;
        }
    });
}
(() => __awaiter(void 0, void 0, void 0, function* () {
    const rslt = yield settingMail(positionals);
    if (typeof rslt !== 'string' || rslt !== '0') {
        console.log('メール設定が失敗しました');
    }
    else {
        console.log('メール設定が成功しました');
    }
}))();
