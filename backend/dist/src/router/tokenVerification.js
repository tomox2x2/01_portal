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
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const jwtHelper_1 = require("../helper/jwtHelper");
const router = express.Router();
//jwtトークンの検証
router.get("/", (req, res) => {
    if (!req.cookies.jwtToken) {
        //cookieにjwtトークンがない場合は、認証不可
        return res.status(200).json({ isAuthenticated: false });
    }
    //  リクエストされたjwtトークンを検証
    const decode = jwtHelper_1.jwtHelper.verifyToken(req.cookies.jwtToken);
    // 確認結果に問題がなければ認証可 / 問題あれば不可
    if (decode) {
        // token の作成
        try {
            //検証がOKであれば、jwtトークンを再作成
            res.cookie("jwtToken", jwtHelper_1.jwtHelper.createToken(), {
                httpOnly: true,
                expires: jwtHelper_1.jwtHelper.setTokenDate(),
                path: '/',
            });
            // 認証可
            return res.status(200).json({ isAuthenticated: true });
        }
        catch (error) {
            return res.status(500).send('An error occured');
        }
    }
    else {
        // 認証不可
        return res.status(200).json({ isAuthenticated: false });
    }
});
exports.default = router;
