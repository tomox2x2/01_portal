import express, { Request, Response } from "express";
import { connectionDB, deleteDB, disconnectFromMySQL, DBBeginTrans, DBCommit, DBRollback, selectDBSec, insertDBSec} from '../../app/connDB';
import mysql from 'mysql2';
import { randomBytes } from 'crypto'
import ms from "ms";
import { encrypt,decrypt } from '../../app/crypt';
import { getComSKEnv } from "../../app/sk";

const router = express.Router();

function makeRandom( minDigit: number, maxDigit: number) : string{
  const S="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const numDigit = Math.random() * ( maxDigit + 1 - minDigit )  + minDigit;

  return randomBytes(numDigit).reduce((p, i) => p + S[(i % S.length)], '')
}

router.post("/makeSK", async (req: Request, res: Response) => {

    const aryInputValue: string[] =[];
    let connect: mysql.Connection | undefined;
    let sqlFormatTxt: string;
    let setID :string = '';
    let setKey :string = '';
    let data1 :mysql.RowDataPacket[];
    let makeSKFlg :boolean = false;

    const comSK = await getComSKEnv();

    try {
      connect = connectionDB();

      // IDがセットされていない場合、ID を作成して返信
      await DBBeginTrans(connect);

        // cookie.ID があるか確認
        if (req.cookies.ID) {

          // cookie.ID がDBに設定されているか確認
          setID = decrypt(req.cookies.ID, comSK);
          sqlFormatTxt = mysql.format(
            "select * from T_SKEYS where ID = ? ", [setID]);
          data1 = await selectDBSec(connect, sqlFormatTxt);

          // cookie.ID がDBに設定されていない場合、再作成
          if (data1.length === 0) {
            makeSKFlg = true;
          // cookie.ID がDBに設定されている場合、そのままSKを返却
          } else {
            makeSKFlg = false;
            setKey = decrypt(data1[0].SECRETKEY,(await getComSKEnv()));
          }
      // cookie.ID が作成されていない場合、作成
      } else {
        makeSKFlg = true;
      }

      if ( makeSKFlg ) {

        while (true) {
          setID = makeRandom(25, 255);
          sqlFormatTxt = mysql.format(
            "select * from T_SKEYS where ID = ? ", [setID]);
          data1 = await selectDBSec(connect, sqlFormatTxt);
          if (data1.length === 0 ) break;
        }

        // ID, SK を T_SKEYS に登録
        setKey = makeRandom(75, 255);
        sqlFormatTxt = mysql.format(
          "insert into T_SKEYS values ( ?, ?, NULL, sysdate() )");
        aryInputValue.push(setID);
        aryInputValue.push(encrypt(setKey, comSK));
        await insertDBSec(connect, sqlFormatTxt,aryInputValue);

        // Cookie に ID(暗号化)を設定
        res.cookie("ID", encrypt(setID, comSK), {
          httpOnly: true,
          expires: new Date(Date.now() + ms("1d")),
          path: '/',
        });
      }

      await DBCommit(connect);
      res.status(200).json({KEY:setKey});

    } catch(error) {
  
      if (connect)  await DBRollback(connect);
      console.error('Error:', error);
      res.status(500).send('An error occured');

    } finally {
  
      if ( connect) disconnectFromMySQL(connect);
    }
  
  });

  router.post("/delSK", async (req: Request, res: Response) => {

    const aryInputValue: string[] =[];
    let connect: mysql.Connection | undefined;
    let sqlFormatTxt: string;

    try {

      if( !req.cookies.ID  ){ return res.status(200).send(); }

      const tarID = decrypt(req.cookies.ID, (await getComSKEnv()));

      connect = connectionDB();
      await DBBeginTrans(connect);

      // T_SKEYS から 該当ID削除
      sqlFormatTxt = 
      " delete from T_SKEYS T1 where T1.ID = ? ";
      await deleteDB(connect, sqlFormatTxt, [tarID]);

      await DBCommit(connect);  

      // Cookie の IDを削除
      res.cookie("ID", "", {
          httpOnly: true,
          expires: new Date(Date.now()),
          path: '/',
      });

      res.status(200).send();

    } catch(error) {
  
      if (connect) await DBRollback(connect);
      console.error('Error:', error);
      res.status(500).send('An error occured');

    } finally {
  
      if ( connect) disconnectFromMySQL(connect);
    }
  });

  export default router;