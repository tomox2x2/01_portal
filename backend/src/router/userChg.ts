import { randomBytes } from 'crypto'
import express, { Request, Response } from "express";
import { connectionDB, selectDB, selectDBSec, insertDBSec,updateDBSec, deleteDB,disconnectFromMySQL, DBBeginTrans, DBCommit, DBRollback } from '../../app/connDB';
import mysql from 'mysql2';
import {decrypt, encrypt} from '../../app/crypt';
import { getComSKEnv, getSK, decUserName } from "../../app/sk";
import { sendMail } from '../../app/mailer'
import { logState, inputLog } from '../../app/inputLog';

const router = express.Router();

router.post("/Read", async (req: Request, res: Response) => {

  const userName = await decUserName(req.cookies.ID);
  
  let sqlFormatTxt: string = "";
  const aryInputValue: string[] =[];
  let rsltFlg: number = 0;
  const pramTgt = 'L0003' 

  let connect: mysql.Connection | undefined;

  try {
    connect = connectionDB();

    // --------------------------------------------------------------------------

    sqlFormatTxt = mysql.format("SELECT MAILADD, PASSWORD from T_USERS where USERNAME = ? ", [userName]);
    const data1 = await selectDBSec(connect, sqlFormatTxt);

    sqlFormatTxt = mysql.format(
      "SELECT T1.PARAM1 as PASTCNT " +
      "from T_PARAMETER T1 " +
      "where T1.PARAMID = ? " ,
        [pramTgt]);
    const data2 = await selectDBSec(connect, sqlFormatTxt);
    
    // --------------------------------------------------------------------------

    res.status(200).json(
      {"mailAdd" : data1[0].MAILADD,
       "passLen" : decrypt(data1[0].PASSWORD, (await getComSKEnv())).length,
       "pastCnt" : data2[0].PASTCNT
      }
    );
    
  } catch(error) {

    if (connect) await DBRollback(connect);
    console.error('Error:', error);
    res.status(500).send('An error occured');
  } finally {

    if (connect) disconnectFromMySQL(connect);
  }
});

router.post("/Chg", async (req: Request, res: Response) => {

    const SK = await getSK(req.cookies.ID);
    const userName = await decUserName(req.cookies.ID);
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
  
      // ユーザなし チェック
      sqlFormatTxt = mysql.format(
        "SELECT 1 from T_USERS where USERNAME = ? ",
         [userName]);
      let data1 = await selectDBSec(connect, sqlFormatTxt);
      if (data1.length == 0) { 
        rsltFlg = -1; 
      } else {

        switch( req.body.mode ) {
          case '1' :
            // パスワード変更
            rsltFlg = await chgPass(connect, userName, pass);
            break;
          case '2' :
            // メールアドレス変更
            rsltFlg = await chgMail(connect, userName, email);
            break;
          default :
            // 全ての属性変更
            rsltFlg = await chgPass(connect, userName, pass);
            if(rsltFlg == 0 ) rsltFlg = await chgMail(connect, userName, email);
            break;
        }
      }

      if (rsltFlg != 0 ) await DBRollback(connect);
      else await DBCommit(connect)
      // --------------------------------------------------------------------------

      inputLog(userName, req.body.ScreenID,req.body.ACT, 
        rsltFlg === 0 ? logState.SUCCESS : logState.FAIL,
        rsltFlg === 0 ? 'UserInfo Change Done' : 'UserInfo Change Failed Flg:' + rsltFlg
      )

      res.send(String(rsltFlg));
      
    } catch(error) {
  
      if (connect) await DBRollback(connect);
      inputLog(userName, req.body.ScreenID,req.body.ACT, 
        logState.FAIL,String(error));
      console.error('Error:', error);
      res.status(500).send('An error occured');
    } finally {
  
      if (connect) disconnectFromMySQL(connect);
    }
  });

  router.post("/Reset", async (req: Request, res: Response) => {

    const SK = await getSK(req.cookies.ID);
    const userName = await decrypt(req.body.userName,SK);
    const email = decrypt(req.body.email, SK); 
    
    let sqlFormatTxt: string = "";
    const aryInputValue: string[] =[];
    let rsltFlg: number = 0;

    let connect: mysql.Connection | undefined;
  
    try {
      connect = connectionDB();
  
      await DBBeginTrans(connect);

      // --------------------------------------------------------------------------
  
      sqlFormatTxt = mysql.format(
        "SELECT MAILADD from T_USERS where USERNAME = ? ",
         [userName]);
      let data1 = await selectDBSec(connect, sqlFormatTxt);

      // ユーザなし チェック
      if (data1.length == 0) { 
        rsltFlg = 1; 

      // メールアドレス チェック
      } else if ( data1[0].MAILADD.toString() !== email ) {
        rsltFlg = 2;

      } else {

        // 新パスワード設定
        // numDigitは 可変 ( 8～20 の間でランダム )
        const S="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
        const numDigit = 8 + Math.floor( Math.random() * 12 );
        const newPass = randomBytes(numDigit).reduce((p, i) => p + S[(i % S.length)], '')
    
        // Parameter ID:パス変更日数
        const paramID = 'L0002'

        // 仮パスワード, パスワード設定日付, リセットフラグ: 1_リセット 設定
        sqlFormatTxt = mysql.format(
          "update T_USERS T1 set " + 
          " T1.PASSWORD = ? ," + 
          " T1.PASSSETDATE = " + 
          "( select adddate(sysdate(), 1 - T1.PARAM1) " + 
          "  from T_PARAMETER T1 where T1.PARAMID = ? )," + 
          " T1.RESETFLG = 1 " + 
          "where T1.USERNAME = ? ",
          [encrypt(newPass,await getComSKEnv()), paramID,userName]);
        await updateDBSec(connect, sqlFormatTxt,[]);

        const mailID = 'X0001';

        // メール送信
        await sendMail(connect, userName, mailID,[newPass]
        )
      }

      if (rsltFlg != 0 ) await DBRollback(connect);
      else await DBCommit(connect)

      inputLog(userName, req.body.ScreenID,req.body.ACT, 
        rsltFlg === 0 ? logState.SUCCESS : logState.FAIL,
        rsltFlg === 0 ? 'PassWord Reset Done' : 'PassWord Reset Failed Flg:' + rsltFlg
      )

      // --------------------------------------------------------------------------

      res.send(String(rsltFlg));
      
    } catch(error) {
  
      if (connect) await DBRollback(connect);
      inputLog(userName, req.body.ScreenID,req.body.ACT, 
               logState.FAIL,String(error));
      console.error('Error:', error);
      res.status(500).send('An error occured');
    } finally {
  
      if (connect) disconnectFromMySQL(connect);
    }
  });

  async function chgPass ( connect: mysql.Connection, userName: string, pass: string) : Promise<number> {

    let sqlFormatTxt = '';
    let rsltFlg = 0;
    const pramTgt = 'L0003' 

    // 現在のパスワード チェック
    sqlFormatTxt = mysql.format(
      "SELECT PASSWORD from T_USERS where USERNAME = ?",
        [userName]);
    let data1 = await selectDBSec(connect, sqlFormatTxt);
    const lastPass = decrypt(data1[0].PASSWORD, await(getComSKEnv()))

    // パスワードが変更前と一緒だったらアラート
    if ( lastPass === pass ) {
      rsltFlg = 1
    } else {

      // 開錠用キー(環境変数)
      const envKey = process.env.ENC_KEY || 'TeSt';

      // 過去履歴パスワードチェック
      sqlFormatTxt = mysql.format(
        "SELECT T1.PASSWORD from T_PASSHIS T1 " + 
        "where exists ( select 1 from T_USERS T2 where T2.USERNAME = ? " +
                       "and T1.USERID = T2.USERID ) "  +
        "order  by PASSSETDATE desc ",
          [userName]);
      data1 = await selectDBSec(connect, sqlFormatTxt);

      // 過去に同じパスワードがあったらアラート(該当したら foreachを抜ける)
      data1.forEach((pastPass) => {
        if( pass == decrypt( pastPass.PASSWORD, envKey ) ) {
          rsltFlg = 2;
          return ;
        };
      })

      // チェック結果：アラートなら本Fnc終了
      if ( rsltFlg != 0 ) return rsltFlg;

      // システム定義に設定されているカウント数以上の履歴があるか確認、
      sqlFormatTxt = mysql.format(
        "SELECT T2.HISCNT + 1 - T1.PARAM1 as DELCNT " +
        "from T_PARAMETER T1, " +
              "( select count(1) as HISCNT from T_PASSHIS  T21 " +
                "where exists ( select 1 from T_USERS T22 " +
                               "where T22.USERNAME = ? " +
                               "and T22.USERID = T21.USERID ) ) T2 " +
        "where T1.PARAMID = ? " ,
          [userName, pramTgt]);
      data1 = await selectDBSec(connect, sqlFormatTxt);

      const delRowCnt = Number(data1[0].DELCNT);

      // システム定義.カウント数 <= 履歴カウント数 なら、
      // 古い履歴（HISNO が1から昇順で指定）を消去
      if ( delRowCnt > 0 ) {

        sqlFormatTxt = mysql.format(
          "delete from T_PASSHIS T1 " + 
          "where exists ( select 1 from T_USERS T2 " + 
                         "where T2.USERNAME = ? " +
                         "and T1.USERID = T2.USERID ) " +
          "and T1.HISNO <= ? " , 
          [userName, delRowCnt ]);
        await deleteDB(connect, sqlFormatTxt,[]);

        // HISNO を消した数分だけデクリメント
        sqlFormatTxt = mysql.format(
          "update T_PASSHIS T1 set T1.HISNO = T1.HISNO - ? " + 
          "where exists ( select 1 from T_USERS T2 where T2.USERNAME = ? " +
                         "and T1.USERID = T2.USERID ) " , 
          [delRowCnt, userName]);
        await updateDBSec(connect, sqlFormatTxt,[]);

      }

      // 前回パスワードを過去履歴に追加
      sqlFormatTxt = mysql.format(
        "insert into T_PASSHIS " + 
        "select T1.USERID, max( coalesce(T2.HISNO, 0) ) + 1, ?, " +
        " max(T1.PASSSETDATE) " +
        "from T_USERS T1 " + 
        "left outer join T_PASSHIS T2 on T1.USERID = T2.USERID " + 
        "where T1.USERNAME = ? " +
        "group by T1.USERID " , 
        [ encrypt(lastPass, envKey), userName ]);
      await insertDBSec(connect, sqlFormatTxt,[]);

      // 新パスワードを T_USERS に設定
      sqlFormatTxt = mysql.format(
        "update T_USERS T1 " + 
        "set T1.PASSWORD = ? ," + 
            "T1.PASSSETDATE = sysdate(), " + 
            "T1.RESETFLG = 0 " + 
        "where T1.USERNAME = ? " , 
        [encrypt(pass,( await(getComSKEnv()))), userName]);
      await updateDBSec(connect, sqlFormatTxt,[]);
      
    }

    return rsltFlg;
  }

  async function chgMail ( connect: mysql.Connection, userName: string, email: string) : Promise<number> {

    let sqlFormatTxt = '';
    let rsltFlg = 0;
    let aryInputValue = [];

    // メールアドレスが設定されている値と同じかどうか確認
    sqlFormatTxt = mysql.format(
      "SELECT 1 from T_USERS where USERNAME = ? and MAILADD = ? ",
        [userName,email]);
    let data1 = await selectDBSec(connect, sqlFormatTxt);
    if ( data1.length > 0 )  rsltFlg = 11;

    // 他ユーザとのメールアドレス重複 チェック
    sqlFormatTxt = mysql.format(
      "SELECT 1 from T_USERS where USERNAME != ? and MAILADD = ? ",
        [userName,email]);
    data1 = await selectDBSec(connect, sqlFormatTxt);
    if ( data1.length > 0 )  rsltFlg = 12;

    if (rsltFlg === 0) {

      sqlFormatTxt = "update T_USERS T1 set " +
                      "T1.MAILADD = ? " +
                      "where T1.USERNAME = ? " ;
      aryInputValue.push(email);
      aryInputValue.push(userName);
      await updateDBSec(connect, sqlFormatTxt, aryInputValue);
    }

    return rsltFlg;
  }

  export default router;