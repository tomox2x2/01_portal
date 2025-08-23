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
const express = __importStar(require("express"));
const chkLogin_1 = __importDefault(require("./chkLogin"));
const newAC_1 = __importDefault(require("./newAC"));
const logout_1 = __importDefault(require("./logout"));
const Words_1 = __importDefault(require("./Words"));
const diary_1 = __importDefault(require("./diary"));
const todo_1 = __importDefault(require("./todo"));
const format_1 = __importDefault(require("./format"));
const userChg_1 = __importDefault(require("./userChg"));
const tokenVerification_1 = __importDefault(require("./tokenVerification"));
const common_1 = __importDefault(require("./common"));
const router = express.Router();
router.use("/chkLogin", chkLogin_1.default);
router.use("/NewAC", newAC_1.default);
router.use("/logout", logout_1.default);
router.use("/Words", Words_1.default);
router.use("/diary", diary_1.default);
router.use("/todo", todo_1.default);
router.use("/format", format_1.default);
router.use("/tokenVerification", tokenVerification_1.default);
router.use("/userChg", userChg_1.default);
router.use("/common", common_1.default);
exports.default = router;
