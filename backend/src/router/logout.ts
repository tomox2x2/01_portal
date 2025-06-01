import express, { Request, Response } from "express";
import mysql from 'mysql2';
import { connectionDB, selectDB, updateDB, disconnectFromMySQL, DBBeginTrans, DBCommit, DBRollback} from '../../app/connDB';
import { encrypt,decrypt } from '../../app/crypt';
import { decUserName, getComSKEnv } from "../../app/sk";
import { logState,inputLog } from "../../app/inputLog";

const router = express.Router();

router.post("/", async (req: Request, res: Response, next) => {

    let connect: mysql.Connection | undefined;
    const aryInputValue: string[] = [];
    const userName = await decUserName(req.cookies.ID);

    try {

        if (req.cookies.jwtToken) {
            
            // JwtToken 削除
            res.cookie("jwtToken","",{
                httpOnly: true,
                expires: new Date(Date.now()),
            })
        }

        if (req.cookies.ID) {

            connect = connectionDB();

            await DBBeginTrans(connect);

            // T_SKEYS の USERNAME を初期化
            const decID = decrypt(req.cookies.ID, (await getComSKEnv()));
            let sqlFormatTxt = mysql.format(
                "update T_SKEYS set USERNAME_E = NULL where ID = ? ",
                [decID])

            await updateDB(connect, sqlFormatTxt, aryInputValue);

            await DBCommit(connect);
        }

        if( userName ) inputLog(userName, req.body.ScreenID, req.body.ACT, logState.SUCCESS,'LOGOUT SUCCESS');

        return res.status(200).send();

    } catch(error) {
        if (connect) await DBRollback(connect);
        inputLog(userName, req.body.ScreenID, req.body.ACT, logState.FAIL,String(error));
        console.error('Error:', error);
        res.status(500).send('An error occured');

    } finally {
  
        if ( connect) disconnectFromMySQL(connect);
    }

});

export default router;