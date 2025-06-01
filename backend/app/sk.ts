import { connectionDB, selectDB, selectDBSec, disconnectFromMySQL } from './connDB';
import * as mysql from 'mysql2';
import { decrypt } from './crypt';
import * as dotenv from 'dotenv';

dotenv.config();

// 後日、作成した共通鍵を作成し、JSONファイルに書き込むファンクションを作成
//  (当該ファンクションを bat から実行する形にする)

export async function getComSKEnv() : Promise<string> {

    const comSKID = process.env.ENC_ID;
    const encKey = process.env.ENC_KEY;

    let connect: mysql.Connection | undefined;
    let sqlFormatTxt: string;

    try {

        connect = connectionDB();

        // 開錠前の USERNAME で T_SKEYS から SK 取得
        sqlFormatTxt = mysql.format(
            "select T1.PARAM1 from T_PARAMETER T1 " +
            " where T1.PARAMID = ?  ", [comSKID]);
        let data1 = await selectDBSec(connect, sqlFormatTxt);

        const comSK = data1[0].PARAM1;

        if ( !comSK || typeof comSK !== "string" ) {
            console.error( 'ENCRIPTION KEY is not defined');
            return '';
        } else if ( !encKey || typeof encKey !== "string" ) {
            console.error( 'ENV KEY is not defined');
            return '';
        }

        return decrypt(comSK, encKey);

    } catch(error) {

        console.error('Error:', error);
        throw error;
        
    } finally {

        if ( connect) disconnectFromMySQL(connect);
    }

}


export async function getSK(ID: string) {

    let connect: mysql.Connection | undefined;
    let sqlFormatTxt: string;

    const comSK = await getComSKEnv();
    const decID : string = decrypt(ID, comSK);

    try {

        connect = connectionDB();

        // 開錠前の USERNAME で T_SKEYS から SK 取得
        sqlFormatTxt = mysql.format(
            "select T1.SECRETKEY from T_SKEYS T1 " +
            " where T1.ID = ?  ", [decID]);
        let data1 = await selectDBSec(connect, sqlFormatTxt);

        const SK = decrypt(data1[0].SECRETKEY, comSK);
        if ( typeof SK !== "string" ) throw new Error("認証キーが不正です");
        return SK;

    } catch(error) {

        console.error('Error:', error);
        throw error;
    } finally {

        if ( connect) disconnectFromMySQL(connect);
    }

};

export async function decUserName(ID: string) {

    let connect: mysql.Connection | undefined;
    let sqlFormatTxt: string;

    if (!ID) return '';

    const comSK = await getComSKEnv();
    const decID : string = decrypt(ID, comSK);

    try {

        connect = connectionDB();

        // 開錠前の USERNAME で T_SKEYS から SK 取得
        sqlFormatTxt = mysql.format(
            "select T1.USERNAME_E, T1.SECRETKEY from T_SKEYS T1 " +
            " where T1.ID = ?  ", [decID]);
        let data1 = await selectDBSec(connect, sqlFormatTxt);

        const SK = decrypt(data1[0].SECRETKEY,comSK);
        const encUSERNAME = data1[0].USERNAME_E;
        let rslt = '';
        if ( typeof SK !== "string" ) throw new Error("認証キーが不正です");

        if ( typeof encUSERNAME === "string" 
            && encUSERNAME.length !== 0 ) rslt = decrypt(encUSERNAME, SK)
        
        return rslt;

    } catch(error) {

        console.error('Error:', error);
        throw error;
    } finally {

        if ( connect) disconnectFromMySQL(connect);
    }


}