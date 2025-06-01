import express, { Express, Request, Response } from "express";
import { connectionDB, selectDB, disconnectFromMySQL, insertDB, DBBeginTrans, DBCommit, DBRollback} from '../../app/connDB';
import mysql from 'mysql2';
import {decrypt, encrypt} from '../../app/crypt';
import { getComSKEnv, getSK } from "../../app/sk";
import { logState,inputLog } from "../../app/inputLog";

const router = express.Router();

router.post("/", async (req: Request, res: Response) => {

    const SK = await getSK(req.cookies.ID);
    const userName = decrypt(req.body.userName, SK);
    const pass = decrypt(req.body.pass, SK); 
    const email = decrypt(req.body.email, SK); 
    
    let sqlFormatTxt: string = "";
    const aryInputValue: string[] =[];
    let rsltFlg: number = 0;
  
    let connect: mysql.Connection | undefined;
  
    try {
      connect = connectionDB();
  
      await DBBeginTrans(connect);

      // --------------------------------------------------------------------------
  
      sqlFormatTxt = mysql.format("SELECT * from T_USERS where USERNAME = ? ", [userName]);
      const data1 = await selectDB(connect, sqlFormatTxt);
  
      sqlFormatTxt = mysql.format("SELECT * from T_USERS where MAILADD = ? ", [email]);
      const data2 = await selectDB(connect, sqlFormatTxt);
      
      if (data1.length > 0) {
        rsltFlg += 1;     // ユーザ重複
      } 
      if ( data2.length > 0 ) {
        rsltFlg += 2;     // メールアドレス重複
      } 
  
      if (rsltFlg === 0) {
  
        sqlFormatTxt = "INSERT INTO T_USERS VALUES ( null, ?, ?, ?, 0, sysdate(), sysdate(), 0 ) ";
        aryInputValue.push(userName);
        aryInputValue.push(encrypt(pass, (await getComSKEnv())));
        aryInputValue.push(email);
        await insertDB(connect, sqlFormatTxt, aryInputValue);
        await DBCommit(connect);
      } 

      inputLog(userName, req.body.ScreenID, req.body.ACT, 
        rsltFlg === 0 ? logState.SUCCESS : logState.FAIL,
        rsltFlg === 0 ? 'New Account Make Success' :
                        'New Account don`t Make Flg:' + rsltFlg
       );
  
      // --------------------------------------------------------------------------

      res.send(String(rsltFlg));
      
    } catch(error) {
  
      if (connect) await DBRollback(connect);
      inputLog(userName, req.body.ScreenID, req.body.ACT, 
        logState.FAIL, String(error));
      console.error('Error:', error);
      res.status(500).send('An error occured');
    } finally {
  
      if (connect) disconnectFromMySQL(connect);
    }
  });

  export default router;