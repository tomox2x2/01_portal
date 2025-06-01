import { Response } from "express";
import * as jwt from "jsonwebtoken";
import ms from "ms";

const def_sek_key = 'D5tTKBRSFJ8LXY3u6jPQhxJNqvyq24fZ';

export class jwtHelper {
    // 秘密鍵
    static jweSecret = process.env.JWT_SECRET || def_sek_key;

    // トークン作成
    static createToken () {
        const token = jwt.sign({ foo: "bar"}, this.jweSecret, {
            expiresIn: "30d",
        });
        return token;
    }

    // トークン確認
    static verifyToken( token: string) {
        try {
            const decoded = jwt.verify(token, this.jweSecret);
            return decoded;
        } catch (err){
            console.error(err);
        }
    }

    // トークン生存期間設定
    static setTokenDate() {
        return new Date(Date.now() + ms("1d"));
    }
}

