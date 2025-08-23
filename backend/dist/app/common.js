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
exports.getDateFormatSQL = void 0;
function getDateFormatSQL(classID) {
    return __awaiter(this, void 0, void 0, function* () {
        let formatStr = '';
        switch (classID) {
            case 1: // 年月日時分秒
                formatStr = '\'%Y.%m.%d %H:%i:%s\'';
                break;
            case 2: // 年月日時分
                formatStr = '\'%Y.%m.%d %H:%i\'';
                break;
            case 3: // 年月日
                formatStr = '\'%Y.%m.%d\'';
                break;
            case 4: // 年月
                formatStr = '\'%Y.%m\'';
                break;
            case 11: // 年月日時分秒(年2桁)
                formatStr = '\'%y.%m.%d %H:%i:%s\'';
                break;
            case 12: // 年月日時分(年2桁)
                formatStr = '\'%y.%m.%d %H:%i\'';
                break;
            case 13: // 年月日(年2桁)
                formatStr = '\'%y.%m.%d\'';
                break;
            case 14: // 年月(年2桁)
                formatStr = '\'%y.%m\'';
                break;
            default:
                break;
        }
        return formatStr;
    });
}
exports.getDateFormatSQL = getDateFormatSQL;
