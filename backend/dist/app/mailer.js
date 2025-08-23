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
exports.sendMail = void 0;
const crypt_1 = require("./crypt");
const nodemailer_1 = __importDefault(require("nodemailer"));
const connDB_1 = require("./connDB");
const mysql2_1 = __importDefault(require("mysql2"));
const sk_1 = require("./sk");
let strSubject;
let strMainText;
let transporter;
let mailOption;
function setMailText(connect, mailID, setValue) {
    return __awaiter(this, void 0, void 0, function* () {
        let sqlFormatTxt = '';
        const format = (str, ...args) => {
            for (const [i, arg] of args.entries()) {
                const regExp = new RegExp(`\\{${i}\\}`, 'g');
                str = str.replace(regExp, arg);
            }
            return str;
        };
        sqlFormatTxt = mysql2_1.default.format("select * from T_MAILVAR T1 " +
            "where T1.MAILID = ?  ", [mailID]);
        let data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
        let aryValue = [];
        if (data1.length != setValue.length)
            throw new Error('システムエラー：設定値の数が不正です。');
        for (let i = 0; i < data1.length; i++) {
            aryValue.push(setValue[i]);
        }
        ;
        sqlFormatTxt = mysql2_1.default.format("select * from T_MAILMST T1 " +
            "where T1.MAILID = ?  ", [mailID]);
        data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
        strSubject = data1[0].SUBJECT;
        let strText = data1[0].TEXT;
        strMainText = format(strText, aryValue);
        return;
    });
}
function sendMail(connect, userName, mailID, settingWord) {
    return __awaiter(this, void 0, void 0, function* () {
        const getSetting = (pUserName) => __awaiter(this, void 0, void 0, function* () {
            const paramID = 'M0001';
            if (!connect)
                throw new Error('システムエラー：connection が設定されていません');
            let sqlFormatTxt = '';
            // transport 設定
            sqlFormatTxt = mysql2_1.default.format("select * from T_PARAMETER T1 " +
                "where T1.PARAMID = ?  ", [paramID]);
            let data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
            const pHost = data1[0].PARAM1.toString();
            const pPort = Number(data1[0].PARAM2.toString());
            const pSecure = Boolean(data1[0].PARAM3.toString());
            const pUser = data1[0].PARAM4.toString();
            const pPass = (0, crypt_1.decrypt)(data1[0].PARAM5.toString(), yield (0, sk_1.getComSKEnv)());
            sqlFormatTxt = mysql2_1.default.format("select T1.MAILADD from T_USERS T1 " +
                "where T1.USERNAME = ?  ", [pUserName]);
            data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
            const pToAdd = data1[0].MAILADD;
            transporter = nodemailer_1.default.createTransport({
                host: pHost, // DB.T_PARAMETER から取得
                port: pPort, // DB.T_PARAMETER から取得
                secure: pSecure, // DB.T_PARAMETER から取得
                auth: {
                    user: pUser, // DB.T_PARAMETER から取得
                    pass: pPass // DB.T_PARAMETER から取得( enc したものを dec して設定)
                },
                tls: {
                    rejectUnauthorized: false, // 証明書検証を無効化
                },
            });
            // メール文面取得・編集
            yield setMailText(connect, mailID, settingWord);
            strMainText = strMainText.replace(/\{userName\}/g, userName);
            strMainText = strMainText.replace(/\{mailAdd\}/g, pUser);
            mailOption = {
                from: pUser, // DB.T_PARAMETER から取得
                to: pToAdd, // DB.T_USERS から取得
                subject: strSubject, // DB.T_MAILMST / T_MAILVAR から取得
                text: strMainText // DB.T_MAILMST / T_MAILVAR から取得
            };
        });
        try {
            yield getSetting(userName);
            const info = yield transporter.sendMail(mailOption);
            console.log('メール送信成功：%s', info.messageId);
        }
        catch (error) {
            console.error('メール送信エラー', error);
            throw error;
        }
    });
}
exports.sendMail = sendMail;
