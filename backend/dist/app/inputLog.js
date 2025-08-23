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
Object.defineProperty(exports, "__esModule", { value: true });
exports.inputLog = exports.logState = void 0;
const connDB_1 = require("./connDB");
exports.logState = {
    SUCCESS: 0,
    FAIL: 9,
    SUCCESS_VISIBLE: 10,
    FAIL_VISIBLE: 19
};
const logVisible = {
    ON: 1,
    OFF: 0
};
function inputLog(userName, screenID, action, state, logStr) {
    return __awaiter(this, void 0, void 0, function* () {
        let sqlTxt;
        let numVis = logVisible.OFF;
        const aryInputValue = [];
        if (state === exports.logState.SUCCESS_VISIBLE ||
            state === exports.logState.FAIL_VISIBLE) {
            numVis = logVisible.ON;
        }
        switch (state) {
            case exports.logState.SUCCESS_VISIBLE:
                state = exports.logState.SUCCESS;
                break;
            case exports.logState.FAIL_VISIBLE:
                state = exports.logState.FAIL;
                break;
            default:
                break;
        }
        const conn = (0, connDB_1.connectionDB)();
        try {
            yield (0, connDB_1.DBBeginTrans)(conn);
            sqlTxt = 'insert into T_LOGS ( ' +
                'select T2.USERID, T1.* from (' +
                'select ? as SCRID, ' +
                '? as ACTION, ' +
                'sysdate() as TIME, ' +
                '? as STATE, ' +
                '? as DETAIL, ' +
                '? as LISTVISIBLE from dual ) T1 ' +
                'left outer join T_USERS T2 on T2.USERNAME = ? )';
            aryInputValue.push(screenID);
            aryInputValue.push(action);
            aryInputValue.push(state.toString());
            aryInputValue.push(Uint8Array.prototype.slice
                .call(Buffer.from(logStr))
                .slice(0, 1000)
                .toString()
                .replace('�', ''));
            aryInputValue.push(numVis.toString());
            aryInputValue.push(userName);
            console.log(aryInputValue);
            yield (0, connDB_1.insertDBSec)(conn, sqlTxt, aryInputValue);
            yield (0, connDB_1.DBCommit)(conn);
        }
        catch (error) {
            yield (0, connDB_1.DBRollback)(conn);
            console.error('Err:' + error);
        }
        finally {
            if (conn)
                (0, connDB_1.disconnectFromMySQL)(conn);
        }
    });
}
exports.inputLog = inputLog;
