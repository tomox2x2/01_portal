import { randomBytes } from 'crypto'
import { encrypt,decrypt } from './crypt';
import { connectionDB, selectDB, updateDB, insertDB,deleteDB, disconnectFromMySQL, DBBeginTrans, DBCommit, DBRollback} from './connDB';
import * as mysql from 'mysql2';

function makeComSK() : string{
    const S="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    const numDigit = 32;
    return randomBytes(numDigit).reduce((p, i) => p + S[(i % S.length)], '')
}

async function replaceDBPass (encKey: string, comSKID: string) {

    const aryInputValue: string[] =[];

    let sqlFormatTxt: string = ''
    let connect: mysql.Connection | undefined;
  
    try {
        connect = connectionDB();

        await DBBeginTrans(connect);

        // T_SKEYS から 全IDデータ削除
        sqlFormatTxt = " delete from T_SKEYS T1 ";
        await deleteDB(connect, sqlFormatTxt, []);

        await DBCommit(connect);

        // --------------------------------------------------------------------------

        await DBBeginTrans(connect);

        // oldKey 読込、
        sqlFormatTxt = mysql.format(
            "select T1.PARAM1 from T_PARAMETER T1 " +
            " where T1.PARAMID = ?  ", [comSKID]);
        let data1 = await selectDB(connect, sqlFormatTxt);
        
        // newKey 生成、設定
        const decNewSK = makeComSK();
        const newSK = encrypt(decNewSK, encKey);

        if (data1.length !== 0) {

          const oldSK = data1[0].PARAM1;
          const decOldSK = decrypt(oldSK, encKey);

          sqlFormatTxt = mysql.format(
              "update T_PARAMETER set PARAM1 = ? where PARAMID = ? ", 
              [ newSK, comSKID]);
          await updateDB(connect, sqlFormatTxt, aryInputValue);

          // UserPass 再生成
          sqlFormatTxt = mysql.format("select * from T_USERS order by USERID");
          data1 = await selectDB(connect, sqlFormatTxt);
          let decPass : string = '';

          for ( const userData of data1) {
              decPass = await decrypt(userData.PASSWORD, decOldSK);
              sqlFormatTxt = mysql.format(
                  "update T_USERS set PASSWORD = ? where USERID = ? ", 
                  [encrypt(decPass, decNewSK), userData.USERID]);
              await updateDB(connect, sqlFormatTxt, aryInputValue);
          }

          // メーラ設定パスワード再作成
          const paramID = 'M0001'
          sqlFormatTxt = mysql.format(
            "select PARAM5 from T_PARAMETER where PARAMID = ? ",
            [paramID]);
          data1 = await selectDB(connect, sqlFormatTxt);
          decPass = await decrypt(data1[0].PARAM5, decOldSK);

          sqlFormatTxt = mysql.format(
            "update T_PARAMETER set PARAM5 = ? where PARAMID = ? ", 
            [encrypt(decPass, decNewSK),paramID]);
          await updateDB(connect, sqlFormatTxt, aryInputValue);

        } else {

          sqlFormatTxt = mysql.format(
              "insert into T_PARAMETER values (?, 'SecretKey', ?, null, null, null, null, '暗号Key' ) ", 
              [ comSKID, newSK ]);
          await insertDB(connect, sqlFormatTxt, aryInputValue);
        }

        await DBCommit(connect);

        // --------------------------------------------------------------------------
  
    } catch(error) {
  
      if (connect) await DBRollback(connect);
      console.error('Error:', error);
    } finally {
  
      if ( connect) disconnectFromMySQL(connect);
    }
  
  };


// 再設定に必要な環境変数取得
const encID = process.env.ENC_ID;
const encKey = process.env.ENC_KEY;

// 両方とも文字列であれば入れ替え実行
if ( ( typeof encID === 'string' && encID.length !== 0 ) 
  && ( typeof encKey === 'string' && encKey.length !== 0 )) {

    // T_SKEYS を全削除, 開錠キーを設定, パスワードを新しいキーで再設定
    replaceDBPass(encKey, encID);

}
