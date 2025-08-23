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
exports.decrypt = exports.encrypt = void 0;
const AES = __importStar(require("crypto-js/aes"));
const Utf8 = __importStar(require("crypto-js/enc-utf8"));
const sha256_1 = __importDefault(require("crypto-js/sha256"));
const encrypt = (plainText, SECRET_KEY) => {
    try {
        const key = (0, sha256_1.default)(SECRET_KEY);
        const enprypted = AES.encrypt(plainText, key.toString());
        return enprypted.toString();
    }
    catch (error) {
        console.error("Decryption error: ", error);
        throw new Error("Failed to decrypt data.");
    }
};
exports.encrypt = encrypt;
const decrypt = (cipherText, SECRET_KEY) => {
    try {
        const key = (0, sha256_1.default)(SECRET_KEY);
        const decrypted = AES.decrypt(cipherText, key.toString());
        return decrypted.toString(Utf8);
    }
    catch (error) {
        console.error("Decryption error: ", error);
        throw new Error("Failed to decrypt data.");
    }
};
exports.decrypt = decrypt;
