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
const sk_1 = require("../../app/sk");
const inputLog_1 = require("../../app/inputLog");
const common_1 = require("../../app/common");
const connDB_1 = require("../../app/connDB");
const mysql2_1 = __importDefault(require("mysql2"));
const router = express_1.default.Router();
router.post("/log/suc/visible", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userName = '';
    try {
        userName = yield (0, sk_1.decUserName)(req.cookies.ID);
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.SUCCESS_VISIBLE, req.body.logText);
        res.status(200).send();
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occured');
    }
}));
router.post("/log/suc/nonVis", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userName = '';
    try {
        userName = yield (0, sk_1.decUserName)(req.cookies.ID);
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.SUCCESS, req.body.logText);
        res.status(200).send();
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occured');
    }
}));
router.post("/log/fail/visible", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userName = '';
    try {
        userName = yield (0, sk_1.decUserName)(req.cookies.ID);
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.FAIL_VISIBLE, req.body.logText);
        res.status(200).send();
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occured');
    }
}));
router.post("/log/fail/nonVis", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userName = '';
    try {
        userName = yield (0, sk_1.decUserName)(req.cookies.ID);
        (0, inputLog_1.inputLog)(userName, req.body.ScreenID, req.body.ACT, inputLog_1.logState.FAIL, req.body.logText);
        res.status(200).send();
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occured');
    }
}));
router.post("/log/list", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let userName = '';
    let timeStr = '';
    let orderStr = '';
    let visibleStr = '';
    const conn = (0, connDB_1.connectionDB)();
    switch (req.body.orderC) {
        case '1': // time 昇順
            orderStr = ' order by TIME ';
            break;
        case '2': // time 降順
            orderStr = ' order by TIME desc ';
            break;
        default:
            break;
    }
    if (!req.body.visible)
        visibleStr = ' and T1.LISTVISIBLE = 1 ';
    timeStr = yield (0, common_1.getDateFormatSQL)(Number(req.body.classID));
    try {
        userName = yield (0, sk_1.decUserName)(req.cookies.ID);
        const data1 = yield (0, connDB_1.selectDB)(conn, mysql2_1.default.format('select USERID, SCRID, ACTION, ' +
            'date_format(TIME, ' + timeStr + ') as TIME, STATE, DETAIL ' +
            'from T_LOGS T1 ' +
            'where exists ( select 1 from T_USERS T2 ' +
            'where T1.USERID = T2.USERID ' +
            'and T2.USERNAME = ? ) ' + visibleStr + orderStr, [userName]));
        res.status(200).json(data1);
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occured');
    }
    finally {
        if (conn)
            (0, connDB_1.disconnectFromMySQL)(conn);
    }
}));
exports.default = router;
