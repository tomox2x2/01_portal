import { connectionDB, DBBeginTrans, disconnectFromMySQL,DBCommit, DBRollback, insertDBSec} from './connDB';

export const logState = {
    SUCCESS: 0,
    FAIL: 9,
    SUCCESS_VISIBLE:10,
    FAIL_VISIBLE:19
} as const satisfies Record<string, number>;

const logVisible = {
    ON: 1,
    OFF: 0
} as const satisfies Record<string, number>;

export async function inputLog (
    userName : string,
    screenID : string, 
    action: string,
    state: number,
    logStr: string) {

    let sqlTxt : string;
    let numVis : number = logVisible.OFF;
    const aryInputValue: string[] = [];

    if (state === logState.SUCCESS_VISIBLE ||
        state === logState.FAIL_VISIBLE) {
            numVis = logVisible.ON
        }

    switch ( state ) {
        case logState.SUCCESS_VISIBLE :
            state = logState.SUCCESS;
            break;
        case logState.FAIL_VISIBLE :
            state = logState.FAIL;
            break;
        default :
            break;
    }

    const conn = connectionDB();

    try {
       
        await DBBeginTrans(conn);

        sqlTxt = 'insert into T_LOGS ( ' +
                    'select T2.USERID, T1.* from (' + 
                        'select ? as SCRID, ' + 
                         '? as ACTION, ' + 
                         'sysdate() as TIME, ' + 
                         '? as STATE, ' + 
                         '? as DETAIL, ' + 
                         '? as LISTVISIBLE from dual ) T1 ' + 
                    'left outer join T_USERS T2 on T2.USERNAME = ? )';
        aryInputValue.push(screenID);
        aryInputValue.push(action);
        aryInputValue.push(state.toString());
        aryInputValue.push(Uint8Array.prototype.slice
                    .call(Buffer.from(logStr))
                    .slice(0, 1000)
                    .toString()
                    .replace('�', ''));
        aryInputValue.push(numVis.toString());
        aryInputValue.push(userName);
 
        console.log(aryInputValue);
        await insertDBSec(conn,sqlTxt,aryInputValue);
        await DBCommit(conn);

    } catch(error) {
        await DBRollback(conn);
        console.error('Err:' + error);
    } finally {
        if(conn) disconnectFromMySQL(conn);
    }
}