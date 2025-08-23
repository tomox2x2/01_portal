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
const crypto_1 = require("crypto");
const ms_1 = __importDefault(require("ms"));
const crypt_1 = require("../../app/crypt");
const sk_1 = require("../../app/sk");
const router = express_1.default.Router();
function makeRandom(minDigit, maxDigit) {
    const S = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const numDigit = Math.random() * (maxDigit + 1 - minDigit) + minDigit;
    return (0, crypto_1.randomBytes)(numDigit).reduce((p, i) => p + S[(i % S.length)], '');
}
router.post("/makeSK", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const aryInputValue = [];
    let connect;
    let sqlFormatTxt;
    let setID = '';
    let setKey = '';
    let data1;
    let makeSKFlg = false;
    const comSK = yield (0, sk_1.getComSKEnv)();
    try {
        connect = (0, connDB_1.connectionDB)();
        // IDがセットされていない場合、ID を作成して返信
        yield (0, connDB_1.DBBeginTrans)(connect);
        // cookie.ID があるか確認
        if (req.cookies.ID) {
            // cookie.ID がDBに設定されているか確認
            setID = (0, crypt_1.decrypt)(req.cookies.ID, comSK);
            sqlFormatTxt = mysql2_1.default.format("select * from T_SKEYS where ID = ? ", [setID]);
            data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
            // cookie.ID がDBに設定されていない場合、再作成
            if (data1.length === 0) {
                makeSKFlg = true;
                // cookie.ID がDBに設定されている場合、そのままSKを返却
            }
            else {
                makeSKFlg = false;
                setKey = (0, crypt_1.decrypt)(data1[0].SECRETKEY, (yield (0, sk_1.getComSKEnv)()));
            }
            // cookie.ID が作成されていない場合、作成
        }
        else {
            makeSKFlg = true;
        }
        if (makeSKFlg) {
            while (true) {
                setID = makeRandom(25, 255);
                sqlFormatTxt = mysql2_1.default.format("select * from T_SKEYS where ID = ? ", [setID]);
                data1 = yield (0, connDB_1.selectDBSec)(connect, sqlFormatTxt);
                if (data1.length === 0)
                    break;
            }
            // ID, SK を T_SKEYS に登録
            setKey = makeRandom(75, 255);
            sqlFormatTxt = mysql2_1.default.format("insert into T_SKEYS values ( ?, ?, NULL, sysdate() )");
            aryInputValue.push(setID);
            aryInputValue.push((0, crypt_1.encrypt)(setKey, comSK));
            yield (0, connDB_1.insertDBSec)(connect, sqlFormatTxt, aryInputValue);
            // Cookie に ID(暗号化)を設定
            res.cookie("ID", (0, crypt_1.encrypt)(setID, comSK), {
                httpOnly: true,
                expires: new Date(Date.now() + (0, ms_1.default)("1d")),
                path: '/',
            });
        }
        yield (0, connDB_1.DBCommit)(connect);
        res.status(200).json({ KEY: setKey });
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
router.post("/delSK", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const aryInputValue = [];
    let connect;
    let sqlFormatTxt;
    try {
        if (!req.cookies.ID) {
            return res.status(200).send();
        }
        const tarID = (0, crypt_1.decrypt)(req.cookies.ID, (yield (0, sk_1.getComSKEnv)()));
        connect = (0, connDB_1.connectionDB)();
        yield (0, connDB_1.DBBeginTrans)(connect);
        // T_SKEYS から 該当ID削除
        sqlFormatTxt =
            " delete from T_SKEYS T1 where T1.ID = ? ";
        yield (0, connDB_1.deleteDB)(connect, sqlFormatTxt, [tarID]);
        yield (0, connDB_1.DBCommit)(connect);
        // Cookie の IDを削除
        res.cookie("ID", "", {
            httpOnly: true,
            expires: new Date(Date.now()),
            path: '/',
        });
        res.status(200).send();
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
exports.default = router;
