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
const mysql2_1 = __importDefault(require("mysql2"));
const connDB_1 = require("../../app/connDB");
const crypt_1 = require("../../app/crypt");
const sk_1 = require("../../app/sk");
const inputLog_1 = require("../../app/inputLog");
const router = express_1.default.Router();
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let connect;
    const aryInputValue = [];
    const userName = yield (0, sk_1.decUserName)(req.cookies.ID);
    try {
        if (req.cookies.jwtToken) {
            // JwtToken 削除
            res.cookie("jwtToken", "", {
                httpOnly: true,
                expires: new Date(Date.now()),
            });
        }
        if (req.cookies.ID) {
            connect = (0, connDB_1.connectionDB)();
            yield (0, connDB_1.DBBeginTrans)(connect);
            // T_SKEYS の USERNAME を初期化
            const decID = (0, crypt_1.decrypt)(req.cookies.ID, (yield (0, sk_1.getComSKEnv)()));
            let sqlFormatTxt = mysql2_1.default.format("update T_SKEYS set USERNAME_E = NULL where ID = ? ", [decID]);
            yield (0, connDB_1.updateDB)(connect, sqlFormatTxt, aryInputValue);
            yield (0, connDB_1.DBCommit)(connect);
        }
        if (userName)
            (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.SUCCESS, 'LOGOUT SUCCESS');
        return res.status(200).send();
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
