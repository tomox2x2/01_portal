import express, { Request, Response } from "express";
import { decUserName } from "../../app/sk";
import { logState, inputLog } from "../../app/inputLog";
import { getDateFormatSQL } from "../../app/common";
import { connectionDB,selectDB,disconnectFromMySQL } from "../../app/connDB";
import mysql from 'mysql2';

const router = express.Router();

router.post("/log/suc/visible", async (req : Request, res :Response) =>{

    let userName : string = '';

    try {
        userName = await decUserName(req.cookies.ID) ;
        inputLog(userName, req.body.ScreenID, req.body.ACT,
            logState.SUCCESS_VISIBLE, req.body.logText);
        res.status(200).send();

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occured');

      }
});

router.post("/log/suc/nonVis", async (req : Request, res :Response) =>{

    let userName : string = '';

    try {
        userName = await decUserName(req.cookies.ID) ;
        inputLog(userName, req.body.ScreenID, req.body.ACT,
            logState.SUCCESS, req.body.logText);
        res.status(200).send();

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occured');

      }
});

router.post("/log/fail/visible", async (req : Request, res :Response) =>{

    let userName : string = '';

    try {
        userName = await decUserName(req.cookies.ID) ;
        inputLog(userName, req.body.ScreenID, req.body.ACT,
            logState.FAIL_VISIBLE, req.body.logText);
        res.status(200).send();

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occured');

      }
});

router.post("/log/fail/nonVis", async (req : Request, res :Response) =>{

    let userName : string = '';

    try {
        userName = await decUserName(req.cookies.ID) ;
        inputLog(userName, req.body.ScreenID, req.body.ACT,
            logState.FAIL, req.body.logText);
        res.status(200).send();

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occured');

    }
});

router.post("/log/list", async(req : Request, res: Response) => {

    let userName : string = '';
    let timeStr  : string = '';
    let orderStr : string = '';
    let visibleStr : string = '';
    const conn = connectionDB();

    switch (req.body.orderC) {
        case '1' : // time 昇順
            orderStr = ' order by TIME ';
            break;
        case '2' : // time 降順
            orderStr = ' order by TIME desc ';
            break;
        default :
            break;
    }

    if(!req.body.visible) visibleStr = ' and T1.LISTVISIBLE = 1 '

    timeStr = await getDateFormatSQL(Number(req.body.classID));

    try {
        userName = await decUserName(req.cookies.ID) ;
        
        const data1 = await selectDB(conn, mysql.format(
            'select USERID, SCRID, ACTION, ' + 
            'date_format(TIME, ' + timeStr + ') as TIME, STATE, DETAIL ' + 
            'from T_LOGS T1 ' +
            'where exists ( select 1 from T_USERS T2 ' + 
                            'where T1.USERID = T2.USERID ' +
                            'and T2.USERNAME = ? ) ' + visibleStr + orderStr,
            [userName]
        ));

        res.status(200).json(data1);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('An error occured');

    } finally {
        if(conn) disconnectFromMySQL(conn);
    }
});

export default router;