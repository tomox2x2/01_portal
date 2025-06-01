import express, { Request, Response } from "express";
import { connectionDB, selectDB, insertDB, updateDB, disconnectFromMySQL, DBBeginTrans, DBCommit, DBRollback} from '../../app/connDB';
import mysql from 'mysql2';
import { decUserName } from "../../app/sk";

const router = express.Router();

router.post("/Set", async (req: Request, res: Response) => {

    const userName = await decUserName(req.cookies.ID);
    
    let sqlFormatTxt: string = "";
    const aryInputValue: string[] =[];
    let intDataCnt = 0;
    let targetDataId = "";

    let connect: mysql.Connection | undefined;

    try{
        connect = connectionDB();

        DBBeginTrans(connect);

        // セット済みかどうか確認
        sqlFormatTxt = mysql.format(
            "select count (*) as cnt from T_WORDPARDAY T1" +
            " where exists ( select 1 from T_USERS T2 where T2.USERID = T1.USERID and T2.USERNAME = ? )" + 
            " and CAST(SETDATE as date) = CAST(sysdate() as date )",[userName]);
        const data0 = await selectDB(connect, sqlFormatTxt);

        // セットされているWordがない場合、セット実行
        if ( Number(data0[0].cnt) == 0 ) {

            sqlFormatTxt = mysql.format("select count(*) as cnt from T_MSTWORD");
            const data1 = await selectDB(connect, sqlFormatTxt);
            
            if (typeof data1[0].cnt === 'number') {

                // T_MSTWORD の ID を設定
                intDataCnt = Number(data1[0].cnt); 
                targetDataId = String( Math.round(Math.random() * intDataCnt) )

                // ID が「0」と設定された場合は「1」に設定
                if ( targetDataId == '0' ) targetDataId = '1';

                sqlFormatTxt = mysql.format("select count(*) as cnt " + 
                                            " from T_WORDPARDAY T1 " + 
                                            " where exists ( select 1 from T_USERS T2 where T2.USERID = T1.USERID and T2.USERNAME = ? )",[userName]);
                const data2 = await selectDB(connect, sqlFormatTxt);

                // 対象ユーザの T_WORDPARDAY データがあれば上書きする。
                if (Number(data2[0].cnt) > 0 ) {
                    sqlFormatTxt = "update T_WORDPARDAY T1 set WORDID = ? , SETDATE = sysdate() " + 
                                " where exists ( select 1 from T_USERS T2 where T2.USERID = T1.USERID and T2.USERNAME = ? )" ;
                    aryInputValue.push(targetDataId);
                    aryInputValue.push(userName);
                    await updateDB(connect, sqlFormatTxt, aryInputValue);
                    await DBCommit(connect);
                    res.send("0");
                // 対象ユーザの T_WORDPARDAY データがなければ新たに登録する。
                } else {
                    sqlFormatTxt = "insert into T_WORDPARDAY select USERID, ?, sysdate() from T_USERS where USERNAME = ? ";
                    aryInputValue.push(targetDataId);
                    aryInputValue.push(userName);
                    await insertDB(connect,sqlFormatTxt,aryInputValue);
                    await DBCommit(connect);
                    res.send("0");
                }
            } else {
                res.send('1');
            }
        } else { 
            res.send('0') ;
        }

    } catch ( error ) {

        if ( connect) await DBRollback(connect);
        console.error('Error:', error);
        res.status(500).send('An error occured');
        
    } finally {
  
        if ( connect) disconnectFromMySQL(connect);
    }

})

router.post("/Read", async (req: Request, res: Response) => {

    const userName = await decUserName(req.cookies.ID);
    
    let sqlFormatTxt: string = "";
    const aryInputValue: string[] =[];

    let connect: mysql.Connection | undefined;

    try{

        connect = connectionDB();

        sqlFormatTxt = mysql.format("select T1.WORD, T1.WRITEN from " +
                                    "(select row_number() over( order by WORDID ) as rowNo, WORD, WRITEN from T_MSTWORD ) T1 " + 
                                    " left join T_WORDPARDAY T2  on T1.rowNo = T2.WORDID " + 
                                    " where exists ( select 1 from T_USERS T3 where T3.USERID = T2.USERID and T3.USERNAME = ? ) ", [userName]);
        const data1 = await selectDB(connect, sqlFormatTxt);

        res.send(data1);

    } catch ( error ) {
        console.error('Error:', error);
        res.status(500).send('An error occured');
    } finally {
  
        if ( connect) disconnectFromMySQL(connect);
    }

});

export default router;