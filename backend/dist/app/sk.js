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
exports.decUserName = exports.getSK = exports.getComSKEnv = void 0;
const connDB_1 = require("./connDB");
const mysql = __importStar(require("mysql2"));
const crypt_1 = require("./crypt");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// 後日、作成した共通鍵を作成し、JSONファイルに書き込むファンクションを作成
//  (当該ファンクションを bat から実行する形にする)
function getComSKEnv() {
    return __awaiter(this, void 0, void 0, function* () {
        const comSKID = process.env.ENC_ID;
        const encKey = process.env.ENC_KEY;
        let connect;
        let sqlFormatTxt;
        try {
            connect = (0, connDB_1.connectionDB)();
            // 開錠前の USERNAME で T_SKEYS から SK 取得
            sqlFormatTxt = mysql.format("select T1.PARAM1 from T_PARAMETER T1 " +
                " where T1.PARAMID = ?  ", [comSKID]);
            let data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
            const comSK = data1[0].PARAM1;
            if (!comSK || typeof comSK !== "string") {
                console.error('ENCRIPTION KEY is not defined');
                return '';
            }
            else if (!encKey || typeof encKey !== "string") {
                console.error('ENV KEY is not defined');
                return '';
            }
            return (0, crypt_1.decrypt)(comSK, encKey);
        }
        catch (error) {
            console.error('Error:', error);
            throw error;
        }
        finally {
            if (connect)
                (0, connDB_1.disconnectFromMySQL)(connect);
        }
    });
}
exports.getComSKEnv = getComSKEnv;
function getSK(ID) {
    return __awaiter(this, void 0, void 0, function* () {
        let connect;
        let sqlFormatTxt;
        const comSK = yield getComSKEnv();
        const decID = (0, crypt_1.decrypt)(ID, comSK);
        try {
            connect = (0, connDB_1.connectionDB)();
            // 開錠前の USERNAME で T_SKEYS から SK 取得
            sqlFormatTxt = mysql.format("select T1.SECRETKEY from T_SKEYS T1 " +
                " where T1.ID = ?  ", [decID]);
            let data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
            const SK = (0, crypt_1.decrypt)(data1[0].SECRETKEY, comSK);
            if (typeof SK !== "string")
                throw new Error("認証キーが不正です");
            return SK;
        }
        catch (error) {
            console.error('Error:', error);
            throw error;
        }
        finally {
            if (connect)
                (0, connDB_1.disconnectFromMySQL)(connect);
        }
    });
}
exports.getSK = getSK;
;
function decUserName(ID) {
    return __awaiter(this, void 0, void 0, function* () {
        let connect;
        let sqlFormatTxt;
        if (!ID)
            return '';
        const comSK = yield getComSKEnv();
        const decID = (0, crypt_1.decrypt)(ID, comSK);
        try {
            connect = (0, connDB_1.connectionDB)();
            // 開錠前の USERNAME で T_SKEYS から SK 取得
            sqlFormatTxt = mysql.format("select T1.USERNAME_E, T1.SECRETKEY from T_SKEYS T1 " +
                " where T1.ID = ?  ", [decID]);
            let data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
            const SK = (0, crypt_1.decrypt)(data1[0].SECRETKEY, comSK);
            const encUSERNAME = data1[0].USERNAME_E;
            let rslt = '';
            if (typeof SK !== "string")
                throw new Error("認証キーが不正です");
            if (typeof encUSERNAME === "string"
                && encUSERNAME.length !== 0)
                rslt = (0, crypt_1.decrypt)(encUSERNAME, SK);
            return rslt;
        }
        catch (error) {
            console.error('Error:', error);
            throw error;
        }
        finally {
            if (connect)
                (0, connDB_1.disconnectFromMySQL)(connect);
        }
    });
}
exports.decUserName = decUserName;
