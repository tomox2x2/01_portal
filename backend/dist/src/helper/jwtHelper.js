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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtHelper = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const ms_1 = __importDefault(require("ms"));
const def_sek_key = 'D5tTKBRSFJ8LXY3u6jPQhxJNqvyq24fZ';
class jwtHelper {
    // トークン作成
    static createToken() {
        const token = jwt.sign({ foo: "bar" }, this.jweSecret, {
            expiresIn: "30d",
        });
        return token;
    }
    // トークン確認
    static verifyToken(token) {
        try {
            const decoded = jwt.verify(token, this.jweSecret);
            return decoded;
        }
        catch (err) {
            console.error(err);
        }
    }
    // トークン生存期間設定
    static setTokenDate() {
        return new Date(Date.now() + (0, ms_1.default)("1d"));
    }
}
exports.jwtHelper = jwtHelper;
// 秘密鍵
jwtHelper.jweSecret = process.env.JWT_SECRET || def_sek_key;
