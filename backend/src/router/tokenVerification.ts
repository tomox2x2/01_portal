import * as express from "express";
import { jwtHelper } from "../helper/jwtHelper";

const router = express.Router();

//jwtトークンの検証
router.get("/", (req, res) => {

    if (!req.cookies.jwtToken) {
        //cookieにjwtトークンがない場合は、認証不可
        return res.status(200).json({ isAuthenticated: false });
    }

    //  リクエストされたjwtトークンを検証
    const decode = jwtHelper.verifyToken(req.cookies.jwtToken);

    // 確認結果に問題がなければ認証可 / 問題あれば不可
    if (decode) {

        // token の作成
        try {
            //検証がOKであれば、jwtトークンを再作成
            res.cookie("jwtToken", jwtHelper.createToken(), {
                httpOnly: true,
                expires: jwtHelper.setTokenDate(),
                path: '/',
            });

            // 認証可
            return res.status(200).json({ isAuthenticated: true });

        } catch(error) {

            return res.status(500).send('An error occured');
        } 
    } else {

        // 認証不可
        return res.status(200).json({ isAuthenticated: false });
    }


});

export default router;