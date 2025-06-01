import express, { Request, Response } from "express";
import { connectionDB, selectDB, insertDB, updateDB, deleteDB, disconnectFromMySQL, DBCommit} from '../../app/connDB';
import mysql from 'mysql2';
import { decUserName } from "../../app/sk";
import { logState, inputLog } from "../../app/inputLog";
import { getDateFormatSQL } from "../../app/common";

const router = express.Router();

router.post("/list", async (req: Request, res: Response) => {

    const userName = await decUserName(req.cookies.ID);

    let connect: mysql.Connection | undefined;
    const timeformStr1 = await getDateFormatSQL(12); // 年月日時分
    const timeformStr2 = await getDateFormatSQL(4); // 年月

    let sqlTxt: string = 'select ' +
                         ' DIARYID, TITLE, TEXT, ' +
                         ' date_format(CREATEDATE, ' + timeformStr1 + ' ) as CREATEDATE, ' +
                         ' date_format(UPDATEDATE, ' + timeformStr1 + ' ) as UPDATEDATE ' +
                         ' from T_DIARY T1 ' +
                         ' where exists ( ' +
                         '  select 1 from T_USERS T2 ' +
                         '  where T1.USERID = T2.USERID ' +
                         '  and   T2.USERNAME = ? ) ';

    if ( req.body.searchWord) {
      const searchWordParam = `%${req.body.searchWord}%`;
      sqlTxt += mysql.format(' and ( TITLE like ? or TEXT like ? ) ',
                             [searchWordParam,searchWordParam]);
    } else if (req.body.targetMonth) {
      sqlTxt += mysql.format(' and date_format(CREATEDATE, ' + timeformStr2 + ' ) = ?',[req.body.targetMonth]);
    } else if (req.body.id) {
      sqlTxt += mysql.format(' and DIARYID = ? ',[req.body.id]);
    }
    sqlTxt += ' order by 4 desc, DIARYID desc ';

    try {
      connect = connectionDB();
  
      // --------------------------------------------------------------------------
  
      let sqlFormatTxt: string = 
      mysql.format(sqlTxt, [userName]);
      const data1 = await selectDB(connect, sqlFormatTxt);

      res.status(200).json(data1);
      
      // --------------------------------------------------------------------------
  
    } catch(error) {
  
      console.error('Error:', error);
      res.status(500).send('An error occured');
    } finally {
  
      if ( connect) disconnectFromMySQL(connect);
    }
  
  });
  

  router.post("/index", async (req: Request, res: Response) => {

    const userName = await decUserName(req.cookies.ID);

    let connect: mysql.Connection | undefined;
  
    try {
      connect = connectionDB();
  
      // --------------------------------------------------------------------------
  
      let sqlFormatTxt: string = 
      mysql.format('select ' +
                   ' CREATEMONTH ' +
                   ' from V_DIARYMONTH T1 ' +
                   ' where exists ( ' +
                   '  select 1 from T_USERS T2 ' +
                   '  where T1.USERID = T2.USERID ' +
                   '  and   T2.USERNAME = ? ) ' +
                   ' order by CREATEMONTH desc ', [userName]);
      const data1 = await selectDB(connect, sqlFormatTxt);

      res.status(200).json(data1);
      
      // --------------------------------------------------------------------------
  
    } catch(error) {
  
      console.error('Error:', error);
      res.status(500).send('An error occured');
    } finally {
  
      if ( connect) disconnectFromMySQL(connect);
    }
  
  });


  router.post("/create", async (req: Request, res: Response) => {

    const userName = await decUserName(req.cookies.ID);
    const aryInputValue: string[] =[];

    let connect: mysql.Connection | undefined;
  
    try {
      connect = connectionDB();
  
      let sqlFormatTxt: string = 'insert into T_DIARY ' + 
                                 ' select ' +
                                 '  T1.USERID, max(coalesce( T2.DIARYID, 0 )) + 1, ?, ?, sysdate(), sysdate() ' +
                                 ' from ( select USERID from T_USERS ' + 
                                 '        where USERNAME = ? ) T1 ' +
                                 ' left outer join T_DIARY T2 on T1.USERID = T2.USERID ' +
                                 ' group by T1.USERID ';

      aryInputValue.push(req.body.title);
      aryInputValue.push(req.body.text);
      aryInputValue.push(userName);
      await insertDB(connect, sqlFormatTxt, aryInputValue);

      DBCommit(connect);

      const data1 = await selectDB(connect, 
        mysql.format(
            'select coalesce( max(T1.DIARYID), 0 ) as DIARYID from T_DIARY T1' +
            ' inner join ( select USERID from T_USERS ' + 
            '               where USERNAME = ? ) T2 on T1.USERID = T2.USERID ' ,
            [userName])
      );

      if (data1[0].DIARYID.toString() !== '0' ) {
        inputLog(userName, req.body.ScreenID, req.body.ACT, 
          logState.SUCCESS_VISIBLE,
          'Diary Create : ' + data1[0].DIARYID + ' : ' + req.body.title);
      } else {
        inputLog(userName, req.body.ScreenID, req.body.ACT, 
          logState.FAIL,'Diary Create FAIL ');
      }

      res.status(200).send();
      
    } catch(error) {
  
      inputLog(userName, req.body.ScreenID, req.body.ACT, 
        logState.FAIL,String(error));
      console.error('Error:', error);
      res.status(500).send('An error occured');
    } finally {
  
      if ( connect) disconnectFromMySQL(connect);
    }
  
  });

  router.post("/update", async (req: Request, res: Response) => {

    const userName = await decUserName(req.cookies.ID);
    const aryInputValue: string[] =[];

    let connect: mysql.Connection | undefined;
  
    try {
      connect = connectionDB();
  
      let sqlFormatTxt: string = ' update T_DIARY T1 set ' +
                                 ' TITLE = ? ,' + 
                                 ' TEXT = ? ,' + 
                                 ' UPDATEDATE = sysdate()' + 
                                 ' where exists ( ' + 
                                 '      select 1 from T_USERS T2 ' + 
                                 '      where T1.USERID = T2.USERID and T2.USERNAME = ? )  ' +
                                 ' and DIARYID = ?' ;

      aryInputValue.push(req.body.title);
      aryInputValue.push(req.body.text);
      aryInputValue.push(userName);
      aryInputValue.push(req.body.diaryId);
      
      await updateDB(connect, sqlFormatTxt, aryInputValue);

      DBCommit(connect);

      inputLog(userName, req.body.ScreenID, req.body.ACT, 
        logState.SUCCESS_VISIBLE,
        'Diary Update : ' + req.body.diaryId + ' : ' + req.body.title);

      res.status(200).send();
      
    } catch(error) {
  
      inputLog(userName, req.body.ScreenID, req.body.ACT, 
        logState.FAIL,String(error));
      console.error('Error:', error);
      res.status(500).send('An error occured');
    } finally {
  
      if ( connect) disconnectFromMySQL(connect);
    }
  
  });

  router.post("/delete", async (req: Request, res: Response) => {

    const userName = await decUserName(req.cookies.ID);
    const aryInputValue: string[] =[];

    let connect: mysql.Connection | undefined;
  
    try {
      connect = connectionDB();
  
      let sqlFormatTxt: string = ' delete from T_DIARY T1 ' +
                                 ' where exists ( ' + 
                                 '      select 1 from T_USERS T2 ' + 
                                 '      where T1.USERID = T2.USERID and T2.USERNAME = ? )  ' +
                                 ' and DIARYID = ?' ;

      aryInputValue.push(userName);
      aryInputValue.push(req.body.diaryId);
      
      await deleteDB(connect, sqlFormatTxt, aryInputValue);

      DBCommit(connect);

      inputLog(userName, req.body.ScreenID, req.body.ACT, 
        logState.SUCCESS_VISIBLE,
        'Diary Delete :' + req.body.diaryId + ' : ' + req.body.title);

      res.status(200).send();
      
    } catch(error) {
  
      inputLog(userName, req.body.ScreenID, req.body.ACT, 
        logState.FAIL,String(error));
      console.error('Error:', error);
      res.status(500).send('An error occured');
    } finally {
  
      if ( connect) disconnectFromMySQL(connect);
    }
  
  });

  export default router;