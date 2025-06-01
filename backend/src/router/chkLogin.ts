import express, { Request, Response } from "express";
import { connectionDB, selectDBSec,updateDBSec, disconnectFromMySQL, DBBeginTrans, DBCommit, DBRollback} from '../../app/connDB';
import mysql from 'mysql2';
import { decrypt } from '../../app/crypt';
import { jwtHelper } from "../helper/jwtHelper";
import { getComSKEnv, getSK } from "../../app/sk";
import { logState, inputLog } from "../../app/inputLog";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {

    const SK = await getSK(req.cookies.ID);

    const tarID = await decrypt(req.cookies.ID, (await getComSKEnv()));

    const userName = decrypt(req.body.userName, SK);
    const pass = decrypt(req.body.pass, SK);
    const aryInputValue: string[] =[];

    let connect: mysql.Connection | undefined;
  
    try {

      connect = connectionDB();

      await DBBeginTrans(connect);

      // --------------------------------------------------------------------------

      let sqlFormatTxt: string = mysql.format("select * from T_USERS where USERNAME = ? ", [userName]);
      let data1 = await selectDBSec(connect, sqlFormatTxt);
      let returnCd = '0';

      if (data1.length === 0) {

        returnCd = '1';                    // 対象ユーザなし

      } else if ( decrypt(data1[0].PASSWORD, (await getComSKEnv())) !== pass ) {

        const failCheckID : string  =  'L0001'

        // ログイン失敗回数 インクリメント
        sqlFormatTxt = mysql.format("update T_USERS set LGINFAIL = LGINFAIL + 1 where USERNAME = ? ", [userName])
        await updateDBSec(connect, sqlFormatTxt, aryInputValue);
        await DBCommit(connect);

        sqlFormatTxt = mysql.format(
          "select T1.LGINFAIL from T_USERS T1 " + 
          "where T1.USERNAME = ? " +
          "and T1.LGINFAIL >= " + 
          " ( select T2.PARAM1 from T_PARAMETER T2 where PARAMID = ? ) "
          , [userName, failCheckID]);
        data1 = await selectDBSec(connect, sqlFormatTxt);
  
        if (data1.length === 0) returnCd = '2'; // パスワード不正
        else returnCd = '3';       // パスワード不正 かつ 回数超過

      } else {

        const passChgID = 'L0002';

        //ログイン変更期限チェック
        sqlFormatTxt = mysql.format(
          "select 1 from T_USERS T1 " + 
          "where T1.USERNAME = ? " +
          "and  DATEDIFF( sysdate(), T1.LGINFAIL) > " + 
          " ( select T2.PARAM1 from T_PARAMETER T2 where PARAMID = ? ) "
          , [userName, passChgID]);
        data1 = await selectDBSec(connect, sqlFormatTxt);

        if( data1.length !== 0 ) {
          returnCd =  '4'; // 変更期限超過判定
        } 

        //仮パスワードでのログイン（リセットフラグ）
        sqlFormatTxt = mysql.format(
          "select 1 from T_USERS T1 " + 
          "where T1.USERNAME = ? " +
          "and   T1.RESETFLG = 1 "
          , [userName, passChgID]);
        data1 = await selectDBSec(connect, sqlFormatTxt);

        if( data1.length !== 0 ) {
          returnCd =  '5'; // パスワードリセット
        } 

        // ログイン失敗回数 クリア / ログイン時間更新
        sqlFormatTxt = mysql.format(
          "update T_USERS set LGINFAIL = 0, LGINTIME = sysdate() where USERNAME = ? ", 
          [userName])
        await updateDBSec(connect, sqlFormatTxt, aryInputValue);

        // T_SKEY.USERNAME_E に ユーザ名(暗号化)を設定
        sqlFormatTxt = mysql.format(
          "update T_SKEYS set USERNAME_E = ? where ID = ? ", 
          [req.body.userName, tarID])
        await updateDBSec(connect, sqlFormatTxt, aryInputValue);

        // jwtToken トークンを生成
        res.cookie("jwtToken", jwtHelper.createToken(), {
            httpOnly: true,
            expires: jwtHelper.setTokenDate(),
            path: '/',
        });

        await DBCommit(connect);

      }

      switch(returnCd) {
        case '0' :
          inputLog(userName, req.body.ScreenID, req.body.ACT, 
            logState.SUCCESS,'LOGIN SUCCESS');
          break;
        case '3' :
          inputLog(userName, req.body.ScreenID, req.body.ACT, 
            logState.FAIL,'LOCKOUT');
          break;
        default :
          break;
      }

      res.send(returnCd);

      // --------------------------------------------------------------------------
  
    } catch(error) {
  
      if (connect) await DBRollback(connect);
      inputLog(userName, req.body.ScreenID, req.body.ACT, 
        logState.FAIL,String(error));
      console.error('Error:', error);
      res.status(500).send('An error occured');
    } finally {
  
      if ( connect) disconnectFromMySQL(connect);
    }
  
  });
  
  export default router;