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
const crypto_1 = require("crypto");
const crypt_1 = require("./crypt");
const connDB_1 = require("./connDB");
const mysql = __importStar(require("mysql2"));
function makeComSK() {
    const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const numDigit = 32;
    return (0, crypto_1.randomBytes)(numDigit).reduce((p, i) => p + S[(i % S.length)], '');
}
function replaceDBPass(encKey, comSKID) {
    return __awaiter(this, void 0, void 0, function* () {
        const aryInputValue = [];
        let sqlFormatTxt = '';
        let connect;
        try {
            connect = (0, connDB_1.connectionDB)();
            yield (0, connDB_1.DBBeginTrans)(connect);
            // T_SKEYS から 全IDデータ削除
            sqlFormatTxt = " delete from T_SKEYS T1 ";
            yield (0, connDB_1.deleteDB)(connect, sqlFormatTxt, []);
            yield (0, connDB_1.DBCommit)(connect);
            // --------------------------------------------------------------------------
            yield (0, connDB_1.DBBeginTrans)(connect);
            // oldKey 読込、
            sqlFormatTxt = mysql.format("select T1.PARAM1 from T_PARAMETER T1 " +
                " where T1.PARAMID = ?  ", [comSKID]);
            let data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
            // newKey 生成、設定
            const decNewSK = makeComSK();
            const newSK = (0, crypt_1.encrypt)(decNewSK, encKey);
            if (data1.length !== 0) {
                const oldSK = data1[0].PARAM1;
                const decOldSK = (0, crypt_1.decrypt)(oldSK, encKey);
                sqlFormatTxt = mysql.format("update T_PARAMETER set PARAM1 = ? where PARAMID = ? ", [newSK, comSKID]);
                yield (0, connDB_1.updateDB)(connect, sqlFormatTxt, aryInputValue);
                // UserPass 再生成
                sqlFormatTxt = mysql.format("select * from T_USERS order by USERID");
                data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
                let decPass = '';
                for (const userData of data1) {
                    decPass = yield (0, crypt_1.decrypt)(userData.PASSWORD, decOldSK);
                    sqlFormatTxt = mysql.format("update T_USERS set PASSWORD = ? where USERID = ? ", [(0, crypt_1.encrypt)(decPass, decNewSK), userData.USERID]);
                    yield (0, connDB_1.updateDB)(connect, sqlFormatTxt, aryInputValue);
                }
                // メーラ設定パスワード再作成
                const paramID = 'M0001';
                sqlFormatTxt = mysql.format("select PARAM5 from T_PARAMETER where PARAMID = ? ", [paramID]);
                data1 = yield (0, connDB_1.selectDB)(connect, sqlFormatTxt);
                decPass = yield (0, crypt_1.decrypt)(data1[0].PARAM5, decOldSK);
                sqlFormatTxt = mysql.format("update T_PARAMETER set PARAM5 = ? where PARAMID = ? ", [(0, crypt_1.encrypt)(decPass, decNewSK), paramID]);
                yield (0, connDB_1.updateDB)(connect, sqlFormatTxt, aryInputValue);
            }
            else {
                sqlFormatTxt = mysql.format("insert into T_PARAMETER values (?, 'SecretKey', ?, null, null, null, null, '暗号Key' ) ", [comSKID, newSK]);
                yield (0, connDB_1.insertDB)(connect, sqlFormatTxt, aryInputValue);
            }
            yield (0, connDB_1.DBCommit)(connect);
            // --------------------------------------------------------------------------
        }
        catch (error) {
            if (connect)
                yield (0, connDB_1.DBRollback)(connect);
            console.error('Error:', error);
        }
        finally {
            if (connect)
                (0, connDB_1.disconnectFromMySQL)(connect);
        }
    });
}
;
// 再設定に必要な環境変数取得
const encID = process.env.ENC_ID;
const encKey = process.env.ENC_KEY;
// 両方とも文字列であれば入れ替え実行
if ((typeof encID === 'string' && encID.length !== 0)
    && (typeof encKey === 'string' && encKey.length !== 0)) {
    // T_SKEYS を全削除, 開錠キーを設定, パスワードを新しいキーで再設定
    replaceDBPass(encKey, encID);
}
